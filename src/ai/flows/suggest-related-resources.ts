'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting related resources
 * (functions, checklists, team members) based on existing entries to help
 * prototype creators quickly populate new entries, improve consistency, and reduce manual input.
 *
 * @module src/ai/flows/suggest-related-resources
 *
 * @exports {
 *   suggestRelatedResources: function
 *   SuggestRelatedResourcesInput: type
 *   SuggestRelatedResourcesOutput: type
 * }
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * Input schema for the suggestRelatedResources flow.
 */
const SuggestRelatedResourcesInputSchema = z.object({
  existingEntries: z
    .string()
    .describe(
      'A string containing a summary of existing entries, including functions, checklists, and team members.
       This information will be used to find resources related to the new entry being created.'
    ),
  newEntryDescription: z
    .string()
    .describe('A description of the new entry being created.'),
});

/**
 * @typedef {object} SuggestRelatedResourcesInput
 * @property {string} existingEntries - A string containing a summary of existing entries.
 * @property {string} newEntryDescription - A description of the new entry being created.
 */
export type SuggestRelatedResourcesInput = z.infer<
  typeof SuggestRelatedResourcesInputSchema
>;

/**
 * Output schema for the suggestRelatedResources flow.
 */
const SuggestRelatedResourcesOutputSchema = z.object({
  suggestedFunctions: z
    .string()
    .describe('A comma-separated list of suggested functions.'),
  suggestedChecklists: z
    .string()
    .describe('A comma-separated list of suggested checklists.'),
  suggestedTeamMembers: z
    .string()
    .describe('A comma-separated list of suggested team members.'),
});

/**
 * @typedef {object} SuggestRelatedResourcesOutput
 * @property {string} suggestedFunctions - A comma-separated list of suggested functions.
 * @property {string} suggestedChecklists - A comma-separated list of suggested checklists.
 * @property {string} suggestedTeamMembers - A comma-separated list of suggested team members.
 */
export type SuggestRelatedResourcesOutput = z.infer<
  typeof SuggestRelatedResourcesOutputSchema
>;

/**
 * This function calls the suggestRelatedResourcesFlow to get suggestions for
 * related resources based on existing entries and a description of a new entry.
 *
 * @param {SuggestRelatedResourcesInput} input - The input to the flow.
 * @returns {Promise<SuggestRelatedResourcesOutput>} - A promise that resolves to the output of the flow.
 */
export async function suggestRelatedResources(
  input: SuggestRelatedResourcesInput
): Promise<SuggestRelatedResourcesOutput> {
  return suggestRelatedResourcesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRelatedResourcesPrompt',
  input: {schema: SuggestRelatedResourcesInputSchema},
  output: {schema: SuggestRelatedResourcesOutputSchema},
  prompt: `Based on the following existing entries: {{{existingEntries}}},
  and the description of the new entry: {{{newEntryDescription}}},
  suggest related functions, checklists, and team members that would be relevant to the new entry.
  Return the suggestions as comma-separated lists.
  Functions: {{suggestedFunctions}}
  Checklists: {{suggestedChecklists}}
  Team Members: {{suggestedTeamMembers}}`,
});

const suggestRelatedResourcesFlow = ai.defineFlow(
  {
    name: 'suggestRelatedResourcesFlow',
    inputSchema: SuggestRelatedResourcesInputSchema,
    outputSchema: SuggestRelatedResourcesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
