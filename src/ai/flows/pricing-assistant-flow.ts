
'use server';
/**
 * @fileOverview Un agente de IA que sugiere precios para productos.
 *
 * - getPriceSuggestion - Una función que devuelve una sugerencia de precio.
 * - PriceSuggestionInput - El tipo de entrada para la función de sugerencia.
 * - PriceSuggestionOutput - El tipo de retorno para la función de sugerencia.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const PriceSuggestionInputSchema = z.object({
  productCost: z.number().describe("El costo de adquisición o fabricación del producto en USD."),
  productDescription: z.string().describe("Una breve descripción del producto, destacando sus características y calidad."),
  targetAudience: z.string().describe("Una descripción del público objetivo o el mercado al que se dirige el producto."),
});
export type PriceSuggestionInput = z.infer<typeof PriceSuggestionInputSchema>;

const PriceSuggestionOutputSchema = z.object({
  suggestedPriceRange: z.object({
    min: z.number().describe("El precio mínimo de venta sugerido en USD."),
    max: z.number().describe("El precio máximo de venta sugerido en USD."),
  }),
  optimalPrice: z.number().describe("El precio de venta óptimo sugerido en USD, que equilibra el margen y el valor percibido."),
  reasoning: z.string().describe("Una breve explicación (1-2 frases) de por qué se sugieren estos precios, considerando el costo, el producto y el público objetivo."),
});
export type PriceSuggestionOutput = z.infe<typeof PriceSuggestionOutputSchema>;

export async function getPriceSuggestion(input: PriceSuggestionInput): Promise<PriceSuggestionOutput> {
  return pricingAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'pricingAssistantPrompt',
  input: {schema: PriceSuggestionInputSchema},
  output: {schema: PriceSuggestionOutputSchema},
  prompt: `Eres un consultor de estrategia de precios experto para pequeñas empresas. Tu tarea es analizar la información de un producto y sugerir un precio de venta óptimo.

Información del Producto:
- Costo del Producto: \${{productCost}}
- Descripción: "{{productDescription}}"
- Público Objetivo: "{{targetAudience}}"

Considerando el costo, el valor percibido basado en la descripción y el poder adquisitivo probable del público objetivo, debes determinar:
1.  Un rango de precios de venta razonable (mínimo y máximo).
2.  Un precio de venta óptimo dentro de ese rango.
3.  Una breve justificación de tu sugerencia.

El precio óptimo debe asegurar un margen de ganancia saludable sin dejar de ser atractivo para el público objetivo. El rango debe reflejar la flexibilidad que el vendedor podría tener.`,
});

const pricingAssistantFlow = ai.defineFlow(
  {
    name: 'pricingAssistantFlow',
    inputSchema: PriceSuggestionInputSchema,
    outputSchema: PriceSuggestionOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
