
'use server';
/**
 * @fileOverview Un agente de IA que analiza datos de ventas.
 *
 * - getSalesAnalysis - Una función que devuelve un análisis de ventas.
 * - SalesAnalysisInput - El tipo de entrada para la función de análisis.
 * - SalesAnalysisOutput - El tipo de retorno para la función de análisis.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SalesAnalysisInputSchema = z.object({
  products: z.array(z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
      cost: z.number(),
      unitsSoldThisWeek: z.number(),
      unitsSoldLastWeek: z.number(),
  })).describe("Una lista de productos con sus datos de ventas de esta semana y la semana pasada."),
});
export type SalesAnalysisInput = z.infer<typeof SalesAnalysisInputSchema>;

const SalesAnalysisOutputSchema = z.object({
  analysis: z.string().describe("Un análisis de texto conciso (2-3 párrafos) de los datos de ventas. Incluye una visión general, destaca los productos con mejor y peor rendimiento, y ofrece 1-2 consejos prácticos y específicos para el vendedor. El tono debe ser útil y alentador."),
});
export type SalesAnalysisOutput = z.infer<typeof SalesAnalysisOutputSchema>;

export async function getSalesAnalysis(input: SalesAnalysisInput): Promise<SalesAnalysisOutput> {
  return salesAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'salesAnalysisPrompt',
  input: {schema: SalesAnalysisInputSchema},
  output: {schema: SalesAnalysisOutputSchema},
  prompt: `Eres un analista de ventas experto y amigable para un pequeño negocio. Tu tarea es analizar los siguientes datos de ventas y proporcionar un resumen claro y útil para el dueño del negocio.

Aquí están los datos de ventas de los productos:
{{#each products}}
- Producto: {{name}} (ID: {{id}})
  - Precio: \${{price}}
  - Costo: \${{cost}}
  - Unidades Vendidas (Esta Semana): {{unitsSoldThisWeek}}
  - Unidades Vendidas (Semana Pasada): {{unitsSoldLastWeek}}
{{/each}}

Basado en estos datos, genera un análisis conciso de 2 o 3 párrafos. Tu análisis debe incluir:
1.  Un resumen general del rendimiento de las ventas esta semana en comparación con la semana pasada.
2.  Identifica el producto con mejor rendimiento (el "producto estrella") y por qué.
3.  Identifica el producto con el rendimiento más bajo o que necesita atención.
4.  Proporciona 1 o 2 consejos prácticos y específicos que el vendedor podría implementar para mejorar sus ventas o capitalizar el éxito de sus productos estrella.

Escribe el análisis en un tono positivo y alentador. El objetivo es empoderar al vendedor con información clara y útil.`,
});

const salesAnalysisFlow = ai.defineFlow(
  {
    name: 'salesAnalysisFlow',
    inputSchema: SalesAnalysisInputSchema,
    outputSchema: SalesAnalysisOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
