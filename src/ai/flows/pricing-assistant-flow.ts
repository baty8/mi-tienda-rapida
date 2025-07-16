'use server';
/**
 * @fileoverview A pricing assistant that suggests a price for a product.
 *
 * - suggestPrice - A function that suggests a price for a product.
 * - SuggestPriceInput - The input type for the suggestPrice function.
 * - SuggestPriceOutput - The return type for the suggestPrice function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestPriceInputSchema = z.object({
  productCost: z.number().describe('The cost of the product.'),
  productDescription: z.string().describe('The description of the product.'),
  targetAudience: z.string().describe('The target audience for the product.'),
});
export type SuggestPriceInput = z.infer<typeof SuggestPriceInputSchema>;

const SuggestPriceOutputSchema = z.object({
  suggestion: z.string().describe('A paragraph explaining the reasoning behind the suggested price.'),
  suggestedPrice: z.number().describe('The suggested price for the product.'),
  priceRange: z.object({
    min: z.number().describe('The minimum suggested price.'),
    max: z.number().describe('The maximum suggested price.'),
  }),
});
export type SuggestPriceOutput = z.infer<typeof SuggestPriceOutputSchema>;

export async function suggestPrice(input: SuggestPriceInput): Promise<SuggestPriceOutput> {
  return suggestPriceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPricePrompt',
  input: { schema: SuggestPriceInputSchema },
  output: { schema: SuggestPriceOutputSchema },
  prompt: `You are a pricing expert for e-commerce. Your task is to suggest a retail price for a product based on its cost, description, and target audience.

Product Cost: $ {{productCost}}
Product Description: {{{productDescription}}}
Target Audience: {{{targetAudience}}}

Analyze the information provided and suggest a price that would be attractive to the target audience while ensuring a healthy profit margin. Provide a brief explanation for your suggestion.
Output the suggested price, a price range, and a justification.`,
});

const suggestPriceFlow = ai.defineFlow(
  {
    name: 'suggestPriceFlow',
    inputSchema: SuggestPriceInputSchema,
    outputSchema: SuggestPriceOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
