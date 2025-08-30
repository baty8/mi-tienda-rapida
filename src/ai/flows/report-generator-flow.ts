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
You are a business analyst expert for e-commerce. Your task is to generate a "Sales Performance Report".
Analyze the provided product and sales data for the period: {{criteria.period}}.

**Product Inventory:**
{{#each products}}
- {{name}}: \${{price}}, Stock: {{stock}}
{{/each}}

**Sales Data:**
{{#each sales}}
- Sold {{unitsSold}} of "{{productName}}" for \${{totalRevenue}}
{{/each}}

**Report Structure:**
1.  **Executive Summary:** A brief overview of the key findings.
2.  **Top-Performing Products:** List the top 3 products by revenue and units sold.
3.  **Underperforming Products:** Identify products with low sales.
4.  **Key Insights & Trends:** What trends or patterns can you identify?
5.  **Actionable Recommendations:** Provide 2-3 concrete recommendations to improve sales or inventory management.

The output should be a detailed report in Markdown format.
`;

const catalogRecommendationPrompt = `
You are a merchandising expert. Your task is to generate a "Catalog Recommendation Report".
Based on the sales data, recommend which products to feature in a new catalog.

**Product Inventory:**
{{#each products}}
- {{name}}: \${{price}}, Stock: {{stock}}
{{/each}}

**Sales Data:**
{{#each sales}}
- Sold {{unitsSold}} of "{{productName}}" for \${{totalRevenue}}
{{/each}}

**Report Structure:**
1.  **Top Sellers to Feature:** List the top 5 products that are selling well and should be highlighted.
2.  **Hidden Gems:** Identify products with good potential (e.g., high price, good stock) but low sales that could be promoted.
3.  **Bundling Opportunities:** Suggest 2-3 product bundles that could be offered as a special deal.
4.  **Catalog Theme Idea:** Propose a creative name or theme for a new catalog based on these recommendations (e.g., "Summer Essentials", "Customer Favorites").

The output should be a detailed report in Markdown format.
`;

const projectionPrompt = `
You are a data scientist specializing in sales forecasting. Your task is to generate a "Sales Projection Report".
Analyze the historical sales data and project sales for the next period.

**This is a placeholder prompt. In a real scenario, you would use more complex models. For now, provide a qualitative projection.**

**Sales Data:**
{{#each sales}}
- Sold {{unitsSold}} of "{{productName}}" for \${{totalRevenue}}
{{/each}}

**Report Structure:**
1.  **Current Trend Analysis:** Briefly describe the current sales trend (growing, stable, declining).
2.  **Sales Projection (Next 30 Days):** Based on the current trend, provide a qualitative forecast. Mention which products are likely to continue selling well.
3.  **Factors to Consider:** List 2-3 external or internal factors that could influence future sales (e.g., seasonality, marketing campaigns, stock levels).
4.  **Recommendations for Growth:** Suggest one key action to positively impact the projection.

The output should be a detailed report in Markdown format.
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
