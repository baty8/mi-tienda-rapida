import { z } from 'genkit';

const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  stock: z.number(),
  cost: z.number(),
});

const SalesRecordSchema = z.object({
  productName: z.string(),
  unitsSold: z.number(),
  totalRevenue: z.number(),
});

export const GenerateReportInputSchema = z.object({
  reportType: z.enum(['performance', 'projection', 'catalog_recommendation'])
    .describe('The type of report to generate.'),
  products: z.array(ProductSchema).describe('A list of all products in the inventory.'),
  sales: z.array(SalesRecordSchema).describe('A list of sales records.'),
  criteria: z.object({
    period: z.string().describe('The time period for the report, e.g., "last 30 days".'),
  }).optional().describe('Optional criteria for the report.'),
});
export type GenerateReportInput = z.infer<typeof GenerateReportInputSchema>;

export const GenerateReportOutputSchema = z.object({
  title: z.string().describe('The title of the generated report.'),
  content: z.string().describe('The full content of the report in markdown format. It should be comprehensive, well-structured with headings, lists, and bold text.'),
});
export type GenerateReportOutput = z.infer<typeof GenerateReportOutputSchema>;
