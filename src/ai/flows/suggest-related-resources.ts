'use server';

/**
 * @fileOverview Este arquivo define um fluxo Genkit para sugerir recursos 
 * (trabalhadores, checklists, etc.) com base em funções de produção existentes, 
 * ajudando a acelerar a criação de novas tarefas e a manter a consistência.
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
 * Schema de entrada para o fluxo suggestRelatedResources.
 */
const SuggestRelatedResourcesInputSchema = z.object({
  existingFunctionsAndWorkers: z
    .string()
    .describe(
      'Uma string JSON contendo um resumo das funções de produção existentes e os trabalhadores associados a elas. Ex: `[{"functionName": "Costura Reta", "workers": ["Maria", "João"]}]`.'
    ),
  newFunctionName: z
    .string()
    .describe('O nome da nova função de produção que está sendo criada. Ex: "Inspeção de Qualidade".'),
});

/**
 * @typedef {object} SuggestRelatedResourcesInput
 * @property {string} existingFunctionsAndWorkers - Resumo das funções e trabalhadores existentes.
 * @property {string} newFunctionName - Nome da nova função a ser criada.
 */
export type SuggestRelatedResourcesInput = z.infer<
  typeof SuggestRelatedResourcesInputSchema
>;

/**
 * Schema de saída para o fluxo suggestRelatedResources.
 */
const SuggestRelatedResourcesOutputSchema = z.object({
  suggestedWorkers: z
    .string()
    .describe('Uma lista separada por vírgulas dos trabalhadores sugeridos para a nova função.'),
  reasoning: z
    .string()
    .describe('Uma breve explicação do porquê esses trabalhadores foram sugeridos.'),
});

/**
 * @typedef {object} SuggestRelatedResourcesOutput
 * @property {string} suggestedWorkers - Lista de trabalhadores sugeridos.
 * @property {string} reasoning - A justificativa para a sugestão.
 */
export type SuggestRelatedResourcesOutput = z.infer<
  typeof SuggestRelatedResourcesOutputSchema
>;

/**
 * Esta função chama o fluxo de IA para obter sugestões de recursos
 * com base nas funções existentes e na descrição de uma nova.
 *
 * @param {SuggestRelatedResourcesInput} input - A entrada para o fluxo.
 * @returns {Promise<SuggestRelatedResourcesOutput>} - Uma promessa que resolve com a saída do fluxo.
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
  prompt: `Você é um assistente de gestão de produção para uma fábrica de confecção.
Sua tarefa é sugerir os trabalhadores mais adequados para uma nova função de produção, com base na estrutura existente.

**Contexto Atual (Funções e Trabalhadores Atuais):**
{{{existingFunctionsAndWorkers}}}

**Nova Função a ser Criada:**
"{{{newFunctionName}}}"

Analise o nome da nova função e, com base nas habilidades implícitas dos trabalhadores nas funções existentes, sugira uma lista de trabalhadores para esta nova tarefa. Forneça uma breve justificativa para sua escolha.

Por exemplo, se a nova função é "Revisão de Peças", você pode sugerir trabalhadores que já estão em funções como "Acabamento" ou "Inspeção".

Responda apenas com o JSON de saída solicitado.`,
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
