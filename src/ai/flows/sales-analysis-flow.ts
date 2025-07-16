'use server';
/**
 * @fileoverview A sales analysis agent that provides insights on sales data.
 *
 * - analyzeSales - A function that analyzes sales data and provides insights.
 * - SalesAnalysisInput - The input type for the analyzeSales function.
 * - SalesAnalysisOutput - The return type for the analyzeSales function.
 */
import type { Product } from '@/types';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Simulate a simplified sales record for analysis
const SalesRecordSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  unitsSold: z.number(),
  totalRevenue: z.number(),
  day: z.string(),
});

const SalesAnalysisInputSchema = z.object({
  products: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    stock: z.number(),
    cost: z.number(),
  })).describe("A list of all products in the inventory."),
  sales: z.array(SalesRecordSchema).describe('A list of sales records from the past week.'),
});
export type SalesAnalysisInput = z.infer<typeof SalesAnalysisInputSchema>;

const SalesAnalysisOutputSchema = z.object({
  analysis: z.string().describe('A short, insightful analysis of the sales data provided. Identify trends, top-performing products, and provide one actionable recommendation. The tone should be encouraging and helpful for a small business owner.'),
});
export type SalesAnalysisOutput = z.infer<typeof SalesAnalysisOutputSchema>;

export async function analyzeSales(input: SalesAnalysisInput): Promise<SalesAnalysisOutput> {
  return salesAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'salesAnalysisPrompt',
  input: { schema: SalesAnalysisInputSchema },
  output: { schema: SalesAnalysisOutputSchema },
  prompt: `You are an expert sales analyst for small e-commerce businesses.
Your goal is to provide a clear, concise, and actionable analysis of the provided sales and product data.

Here is the list of all products in the inventory:
{{#each products}}
- {{name}} (ID: {{id}}, Price: \${{price}}, Stock: {{stock}}, Cost: \${{cost}})
{{/each}}

Here are the sales records from the past week:
{{#each sales}}
- On {{day}}, sold {{unitsSold}} units of "{{productName}}" for a total of \${{totalRevenue}}.
{{/each}}

Based on this data, provide a short analysis (2-3 sentences). Identify the top-performing product or any interesting trends. Conclude with ONE actionable piece of advice for the business owner to increase sales or manage inventory better.
`,
});

const salesAnalysisFlow = ai.defineFlow(
  {
    name: 'salesAnalysisFlow',
    inputSchema: SalesAnalysisInputSchema,
    outputSchema: SalesAnalysisOutputSchema,
  },
  async (input) => {
    // If there are no sales, return a default message without calling the LLM.
    if (input.sales.length === 0) {
      return {
        analysis: "Cuando comiences a registrar ventas, la IA analizará tus datos y te dará consejos prácticos aquí para ayudarte a crecer."
      };
    }

    const { output } = await prompt(input);
    return output!;
  }
);
