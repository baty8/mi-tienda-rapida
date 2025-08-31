
'use server';
/**
 * @fileoverview An AI agent that generates business reports based on product and sales data.
 *
 * - generateReport - A function that generates a report based on a template.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { GenerateReportInputSchema, type GenerateReportInput, GenerateReportOutputSchema, type GenerateReportOutput } from './types';


export async function generateReport(input: GenerateReportInput): Promise<GenerateReportOutput> {
  return reportGeneratorFlow(input);
}

const mainPromptTemplate = `
Eres un experto analista de e-commerce para el mercado de Latinoamérica.
Tu tarea es generar un reporte conciso y útil para un vendedor, basado en el tipo de reporte solicitado.
Analiza la siguiente lista de productos:

**Productos:**
{{#each products}}
- Nombre: {{name}}, Precio: \${{price}}, Costo: \${{cost}}, Stock: {{stock}}, Visible: {{#if visible}}Sí{{else}}No{{/if}}, Categoría: {{category}}
{{/each}}

---

{{#if (eq reportType "catalog")}}
**Reporte de Catálogo:**

1.  **Resumen General:** Proporciona un resumen de la situación actual del catálogo. Incluye el número total de productos, cuántos están activos (visibles) y cuántos pausados (ocultos).
2.  **Análisis de Precios:** Calcula y muestra el precio promedio de los productos.
3.  **Análisis de Rentabilidad:** Calcula la relación costo/precio promedio (margen bruto porcentual promedio).
4.  **Análisis de Inventario:** Indica el stock total (suma de todas las unidades) y el stock promedio por producto.
5.  **Conclusiones Clave (IA):** Basado en los datos, destaca 2 o 3 hallazgos importantes. Por ejemplo:
    - "Tienes un 60% de tu stock concentrado en solo 3 productos, lo que podría ser un riesgo de concentración."
    - "Tu margen promedio es del 35%, pero he detectado productos con margen inferior al 10% que podrías revisar."
    - "Un 40% de tus productos están ocultos. Considera activarlos si tienes stock."
{{/if}}

{{#if (eq reportType "stock")}}
**Reporte de Stock:**

1.  **Productos Sin Stock:** Lista los productos con stock igual a 0. Esto representa consultas o ventas potenciales perdidas.
2.  **Productos con Stock Alto:** Identifica los 3-5 productos con más unidades en stock. Esto puede indicar un sobre-inventario.
3.  **Análisis General de Stock:** Muestra el valor total del inventario (suma de stock * costo de cada producto).
4.  **Sugerencias de la IA:** Proporciona 2-3 recomendaciones claras y directas basadas en los datos. Por ejemplo:
    - "El producto 'Gorra Azul' tiene 150 unidades y baja rotación. Considera crear una promoción (ej: 2x1 o descuento) para liberar capital."
    - "Tienes 5 productos sin stock. Es prioritario que repongas 'Camisa Blanca' y 'Jean Negro', ya que son los más consultados."
    - "El valor de tu inventario detenido es de $XXXX. Optimizar el stock de los productos con más unidades podría mejorar tu flujo de caja."
{{/if}}

{{#if (eq reportType "pricing_margins")}}
**Reporte de Precios y Márgenes:**

1.  **Distribución de Precios:** Muestra el producto más caro y el más barato para dar un rango de precios.
2.  **Análisis de Márgenes:** Calcula el margen de ganancia promedio de todo el catálogo.
3.  **Productos con Margen Negativo o Bajo:** Identifica y lista cualquier producto donde el costo es mayor o igual al precio (margen <= 0). También menciona productos con un margen muy bajo (ej: < 15%).
4.  **Advertencias de la IA:** Proporciona 2-3 advertencias o recomendaciones clave. Por ejemplo:
    - "¡Atención! El producto 'Lámpara de Escritorio' se vende a $500 pero su costo es $520. Estás perdiendo dinero con cada venta."
    - "Tu precio promedio en la categoría 'Electrónica' es un 20% más alto que en 'Hogar'. Asegúrate de que esto sea intencional y esté justificado."
    - "El margen promedio de tu tienda es del 45%, lo cual es saludable. Para aumentarlo, considera revisar los costos de los productos con menor margen."
{{/if}}

La salida debe ser un reporte detallado en formato Markdown y completamente en español, con un tono amigable y profesional.
`;


const reportGeneratorPrompt = ai.definePrompt({
  name: `reportGeneratorMasterPrompt`,
  input: { schema: GenerateReportInputSchema },
  output: { schema: z.string().describe('The full report in markdown format.') },
  prompt: mainPromptTemplate,
  model: 'googleai/gemini-1.5-flash-latest',
  config: {
    temperature: 0.3,
  },
  customize: (prompt) => {
    prompt.helpers = {
        eq: (a: string, b: string) => a === b,
    };
    return prompt;
  }
});


const reportGeneratorFlow = ai.defineFlow(
  {
    name: 'reportGeneratorFlow',
    inputSchema: GenerateReportInputSchema,
    outputSchema: GenerateReportOutputSchema,
  },
  async (input) => {

    const titleMap = {
        catalog: 'Reporte de Análisis de Catálogo',
        stock: 'Reporte de Análisis de Stock',
        pricing_margins: 'Reporte de Precios y Márgenes',
    }
    
    const { output } = await reportGeneratorPrompt(input);

    if (!output) {
      throw new Error('The AI model did not return a valid report. Please try again.');
    }

    return {
      title: titleMap[input.reportType],
      content: output,
    };
  }
);
