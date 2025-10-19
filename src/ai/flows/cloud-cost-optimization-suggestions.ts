// src/ai/flows/cloud-cost-optimization-suggestions.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing cloud cost optimization suggestions.
 *
 * - getCloudCostOptimizationSuggestions - A function that analyzes cloud spending and provides actionable recommendations.
 * - CloudCostOptimizationInput - The input type for the getCloudCostOptimizationSuggestions function.
 * - CloudCostOptimizationOutput - The return type for the getCloudCostOptimizationSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CloudCostOptimizationInputSchema = z.object({
  cloudProvider: z
    .enum(['AWS', 'Azure', 'GCP'])
    .describe('The cloud provider to analyze.'),
  spendingData: z
    .string()
    .describe(
      'A JSON string containing detailed spending data for the specified cloud provider.'
    ),
});
export type CloudCostOptimizationInput = z.infer<
  typeof CloudCostOptimizationInputSchema
>;

const CloudCostOptimizationOutputSchema = z.object({
  suggestions: z
    .string()
    .describe(
      'A list of actionable recommendations for cost optimization.'
    ),
});
export type CloudCostOptimizationOutput = z.infer<
  typeof CloudCostOptimizationOutputSchema
>;

export async function getCloudCostOptimizationSuggestions(
  input: CloudCostOptimizationInput
): Promise<CloudCostOptimizationOutput> {
  return cloudCostOptimizationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'cloudCostOptimizationPrompt',
  input: {schema: CloudCostOptimizationInputSchema},
  output: {schema: CloudCostOptimizationOutputSchema},
  prompt: `You are an expert cloud cost optimization consultant.

  Analyze the provided cloud spending data and provide actionable recommendations for cost optimization.

  Cloud Provider: {{{cloudProvider}}}
  Spending Data: {{{spendingData}}}

  Provide suggestions for:
  - Reducing unused resources
  - Optimizing instance sizes
  - Utilizing reserved instances or committed use discounts
  - Identifying and eliminating waste

  Format your suggestions as a bulleted list.
  `,
});

const cloudCostOptimizationFlow = ai.defineFlow(
  {
    name: 'cloudCostOptimizationFlow',
    inputSchema: CloudCostOptimizationInputSchema,
    outputSchema: CloudCostOptimizationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
