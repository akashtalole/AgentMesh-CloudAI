'use server';

/**
 * @fileOverview A cross-client insight sharing AI agent. This flow facilitates the sharing of insights and coordination
 * of activities across different client environments within an MSP, leveraging A2A protocol to improve service delivery
 * and efficiency without compromising client isolation or data security.
 *
 * - crossClientInsightSharing - A function that handles the cross-client insight sharing process.
 * - CrossClientInsightSharingInput - The input type for the crossClientInsightSharing function.
 * - CrossClientInsightSharingOutput - The return type for the crossClientInsightSharing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CrossClientInsightSharingInputSchema = z.object({
  currentClientEnvironment: z
    .string()
    .describe('The current client environment identifier.'),
  performanceMetrics: z
    .string()
    .describe('Performance metrics from the current client environment.'),
  securityAlerts: z
    .string()
    .describe('Security alerts from the current client environment.'),
  optimizationSuggestions: z
    .string()
    .describe(
      'Optimization suggestions applicable to multiple client environments.'
    ),
});
export type CrossClientInsightSharingInput =
  z.infer<typeof CrossClientInsightSharingInputSchema>;

const CrossClientInsightSharingOutputSchema = z.object({
  sharedInsights: z
    .string()
    .describe('Insights that can be shared across client environments.'),
  coordinationActivities: z
    .string()
    .describe(
      'Coordinated activities to improve service delivery across clients.'
    ),
  securityConsiderations: z
    .string()
    .describe(
      'Security considerations for sharing insights across client environments.'
    ),
});
export type CrossClientInsightSharingOutput =
  z.infer<typeof CrossClientInsightSharingOutputSchema>;

export async function crossClientInsightSharing(
  input: CrossClientInsightSharingInput
): Promise<CrossClientInsightSharingOutput> {
  return crossClientInsightSharingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'crossClientInsightSharingPrompt',
  input: {schema: CrossClientInsightSharingInputSchema},
  output: {schema: CrossClientInsightSharingOutputSchema},
  prompt: `You are an MSP agent responsible for sharing insights and coordinating activities across multiple client environments.

  Current Client Environment: {{{currentClientEnvironment}}}
  Performance Metrics: {{{performanceMetrics}}}
  Security Alerts: {{{securityAlerts}}}
  Optimization Suggestions: {{{optimizationSuggestions}}}

  Based on the information above, identify insights that can be shared across client environments, coordinated activities to improve service delivery, and security considerations for sharing insights.

  Ensure that client isolation and data security are not compromised when sharing insights and coordinating activities.

  Output the shared insights, coordination activities, and security considerations in a structured format.
  `,
});

const crossClientInsightSharingFlow = ai.defineFlow(
  {
    name: 'crossClientInsightSharingFlow',
    inputSchema: CrossClientInsightSharingInputSchema,
    outputSchema: CrossClientInsightSharingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
