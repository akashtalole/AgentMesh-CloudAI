// src/ai/flows/automated-security-compliance-remediation.ts
'use server';

/**
 * @fileOverview An AI agent for automated security compliance remediation.
 *
 * - automatedSecurityComplianceRemediation - A function that handles the security compliance and remediation process.
 * - AutomatedSecurityComplianceRemediationInput - The input type for the automatedSecurityComplianceRemediation function.
 * - AutomatedSecurityComplianceRemediationOutput - The return type for the automatedSecurityComplianceRemediation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutomatedSecurityComplianceRemediationInputSchema = z.object({
  enterpriseEnvironmentDescription: z
    .string()
    .describe('A detailed description of the enterprise environment, including cloud platforms, on-premise systems, and security tools.'),
  industryStandards: z
    .string()
    .describe('The industry standards and regulatory requirements to comply with (e.g., SOC 2, HIPAA, PCI DSS).'),
});
export type AutomatedSecurityComplianceRemediationInput =
  z.infer<typeof AutomatedSecurityComplianceRemediationInputSchema>;

const AutomatedSecurityComplianceRemediationOutputSchema = z.object({
  vulnerabilityScanReport: z
    .string()
    .describe('A report summarizing the identified security vulnerabilities.'),
  complianceViolationReport: z
    .string()
    .describe('A report detailing compliance violations against the specified industry standards.'),
  remediationPlan: z
    .string()
    .describe('A detailed plan for automatically remediating the identified vulnerabilities and compliance violations.'),
  remediationExecutionStatus: z
    .string()
    .describe('The execution status of the automated remediation plan.'),
});
export type AutomatedSecurityComplianceRemediationOutput =
  z.infer<typeof AutomatedSecurityComplianceRemediationOutputSchema>;

export async function automatedSecurityComplianceRemediation(
  input: AutomatedSecurityComplianceRemediationInput
): Promise<AutomatedSecurityComplianceRemediationOutput> {
  return automatedSecurityComplianceRemediationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'automatedSecurityComplianceRemediationPrompt',
  input: {schema: AutomatedSecurityComplianceRemediationInputSchema},
  output: {schema: AutomatedSecurityComplianceRemediationOutputSchema},
  prompt: `You are an expert security engineer specializing in identifying security vulnerabilities and automatically remediating compliance violations based on industry standards.

You will use this information to scan the enterprise environment for vulnerabilities, identify compliance violations, create a remediation plan, and execute it automatically.

Enterprise Environment Description: {{{enterpriseEnvironmentDescription}}}
Industry Standards: {{{industryStandards}}}

Based on the enterprise environment description and the specified industry standards, generate the following:
1. A vulnerability scan report summarizing the identified security vulnerabilities.
2. A compliance violation report detailing the compliance violations against the specified industry standards.
3. A detailed plan for automatically remediating the identified vulnerabilities and compliance violations.
4. The execution status of the automated remediation plan.

Ensure that the output is well-structured and easy to understand.
`,
});

const automatedSecurityComplianceRemediationFlow = ai.defineFlow(
  {
    name: 'automatedSecurityComplianceRemediationFlow',
    inputSchema: AutomatedSecurityComplianceRemediationInputSchema,
    outputSchema: AutomatedSecurityComplianceRemediationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
