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

const performancePrompt = `
Eres un experto analista de negocios para e-commerce. Tu tarea es generar un "Reporte de Rendimiento de Ventas".
Analiza los datos de productos y ventas proporcionados para el período: {{criteria.period}}.

**Inventario de Productos:**
{{#each products}}
- {{name}}: \${{price}}, Stock: {{stock}}
{{/each}}

**Datos de Ventas:**
{{#each sales}}
- Vendidas {{unitsSold}} unidades de "{{productName}}" por un total de \${{totalRevenue}}
{{/each}}

**Estructura del Reporte (en español):**
1.  **Resumen Ejecutivo:** Una breve descripción de los hallazgos clave.
2.  **Productos de Mejor Desempeño:** Lista los 3 productos más vendidos por ingresos y por unidades.
3.  **Productos de Bajo Desempeño:** Identifica productos con pocas ventas.
4.  **Ideas Clave y Tendencias:** ¿Qué tendencias o patrones puedes identificar en los datos?
5.  **Recomendaciones Accionables:** Proporciona 2-3 recomendaciones concretas para mejorar las ventas o la gestión del inventario.

La salida debe ser un reporte detallado en formato Markdown y completamente en español.
`;

const catalogRecommendationPrompt = `
Eres un experto en merchandising y marketing. Tu tarea es generar un "Reporte de Recomendación de Catálogo".
Basado en los datos de ventas, recomienda qué productos destacar en un nuevo catálogo.

**Inventario de Productos:**
{{#each products}}
- {{name}}: \${{price}}, Stock: {{stock}}
{{/each}}

**Datos de Ventas:**
{{#each sales}}
- Vendidas {{unitsSold}} unidades de "{{productName}}" por un total de \${{totalRevenue}}
{{/each}}

**Estructura del Reporte (en español):**
1.  **Éxitos de Venta para Destacar:** Lista los 5 productos que se están vendiendo bien y deberían ser promocionados.
2.  **Joyas Ocultas:** Identifica productos con buen potencial (ej: precio alto, buen stock) pero con ventas bajas que podrían ser impulsados.
3.  **Oportunidades de Combos (Bundles):** Sugiere 2-3 combos de productos que podrían ofrecerse como una oferta especial.
4.  **Idea para el Tema del Catálogo:** Propón un nombre o tema creativo para el nuevo catálogo basado en estas recomendaciones (ej: "Esenciales de Verano", "Favoritos de los Clientes").

La salida debe ser un reporte detallado en formato Markdown y completamente en español.
`;

const projectionPrompt = `
Eres un científico de datos especializado en proyecciones de ventas. Tu tarea es generar un "Reporte de Proyección de Ventas".
Analiza los datos históricos de ventas y proyecta las ventas para el próximo período.

**Esta es una instrucción de marcador de posición. En un escenario real, usarías modelos más complejos. Por ahora, proporciona una proyección cualitativa.**

**Datos de Ventas:**
{{#each sales}}
- Vendidas {{unitsSold}} unidades de "{{productName}}" por un total de \${{totalRevenue}}
{{/each}}

**Estructura del Reporte (en español):**
1.  **Análisis de Tendencia Actual:** Describe brevemente la tendencia actual de ventas (creciente, estable, decreciente).
2.  **Proyección de Ventas (Próximos 30 días):** Basado en la tendencia actual, proporciona un pronóstico cualitativo. Menciona qué productos es probable que sigan vendiéndose bien.
3.  **Factores a Considerar:** Lista 2-3 factores externos o internos que podrían influir en las ventas futuras (ej: estacionalidad, campañas de marketing, niveles de stock).
4.  **Recomendaciones para el Crecimiento:** Sugiere una acción clave para impactar positivamente la proyección.

La salida debe ser un reporte detallado en formato Markdown y completamente en español.
`;

const getPromptForReportType = (reportType: GenerateReportInput['reportType']) => {
  switch (reportType) {
    case 'performance':
      return performancePrompt;
    case 'catalog_recommendation':
      return catalogRecommendationPrompt;
    case 'projection':
      return projectionPrompt;
    default:
      throw new Error('Invalid report type');
  }
}

const reportGeneratorFlow = ai.defineFlow(
  {
    name: 'reportGeneratorFlow',
    inputSchema: GenerateReportInputSchema,
    outputSchema: GenerateReportOutputSchema,
  },
  async (input) => {

    const titleMap = {
        performance: 'Reporte de Rendimiento de Ventas',
        projection: 'Reporte de Proyección de Ventas',
        catalog_recommendation: 'Reporte de Recomendación de Catálogo',
    }

    const promptTemplate = getPromptForReportType(input.reportType);

    const prompt = ai.definePrompt({
      name: `reportGeneratorPrompt_${input.reportType}`,
      input: { schema: GenerateReportInputSchema },
      output: { schema: z.object({ content: z.string() }) }, // The full report is generated as a single markdown string
      prompt: promptTemplate,
    });

    const { output } = await prompt(input);

    if (!output) {
      throw new Error('The AI model did not return a valid report.');
    }

    return {
      title: titleMap[input.reportType],
      content: output.content,
    };
  }
);
