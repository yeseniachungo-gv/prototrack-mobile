'use server';

/**
 * @fileOverview Este arquivo define um fluxo Genkit para gerar um relatório
 * gerencial diário com base nos dados de produção.
 *
 * @exports {
 *   generateDailyReport: function
 *   GenerateDailyReportInput: type
 *   GenerateDailyReportOutput: type
 * }
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * Schema de entrada para o fluxo generateDailyReport.
 */
const GenerateDailyReportInputSchema = z.object({
  productionData: z
    .string()
    .describe(
      'Uma string JSON contendo todos os dados de produção do dia, incluindo funções, trabalhadores, peças por hora e observações de parada. Ex: `[{"name": "Costura", "workers": ["Maria"], "hours": ["08:00"], "pieces": {"Maria_08:00": 50}, "observations": {}}]`.'
    ),
    dailyGoal: z.string().describe('A meta diária de produção e a função atrelada a ela. Ex: `{"target": 5000, "functionName": "Empacotamento"}`')
});

/**
 * @typedef {object} GenerateDailyReportInput
 * @property {string} productionData - Dados de produção do dia em JSON.
 * @property {string} dailyGoal - A meta diária em JSON.
 */
export type GenerateDailyReportInput = z.infer<
  typeof GenerateDailyReportInputSchema
>;

/**
 * Schema de saída para o fluxo generateDailyReport.
 */
const GenerateDailyReportOutputSchema = z.object({
  reportTitle: z.string().describe("Um título para o relatório. Ex: 'Relatório Gerencial de Produção - DD/MM/YYYY'"),
  summary: z.string().describe('Um parágrafo curto com o resumo geral do dia.'),
  performanceAnalysis: z.string().describe('Análise de desempenho por função e trabalhadores, em markdown.'),
  stoppageAnalysis: z.string().describe('Análise das paradas e tempo perdido, em markdown.'),
  goalAnalysis: z.string().describe('Análise do progresso em relação à meta principal do dia.'),
  recommendations: z.string().describe('Uma lista de recomendações e pontos de atenção, em markdown.'),
});

/**
 * @typedef {object} GenerateDailyReportOutput
 * @property {string} reportTitle - Título do relatório.
 * @property {string} summary - Resumo geral.
 * @property {string} performanceAnalysis - Análise de desempenho.
 * @property {string} stoppageAnalysis - Análise de paradas.
 * @property {string} goalAnalysis - Análise da meta.
 * @property {string} recommendations - Recomendações.
 */
export type GenerateDailyReportOutput = z.infer<
  typeof GenerateDailyReportOutputSchema
>;

/**
 * Esta função chama o fluxo de IA para gerar um relatório gerencial.
 *
 * @param {GenerateDailyReportInput} input - A entrada para o fluxo.
 * @returns {Promise<GenerateDailyReportOutput>} - Uma promessa que resolve com o relatório gerado.
 */
export async function generateDailyReport(
  input: GenerateDailyReportInput
): Promise<GenerateDailyReportOutput> {
  return generateDailyReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDailyReportPrompt',
  input: {schema: GenerateDailyReportInputSchema},
  output: {schema: GenerateDailyReportOutputSchema},
  prompt: `Você é um gerente de produção sênior e especialista em análise de dados para uma confecção. Sua tarefa é analisar os dados de produção de um dia e gerar um relatório gerencial claro, conciso e com insights valiosos para o dono da empresa.

Use um tom profissional e direto. Formate as seções de análise e recomendações usando markdown simples (títulos com \`##\`, listas com \`*\`).

**Dados de Produção do Dia:**
{{{productionData}}}

**Meta Principal do Dia:**
{{{dailyGoal}}}

**Sua Tarefa:**

Analise os dados fornecidos e gere um relatório estruturado.

1.  **Título do Relatório**: Crie um título claro que inclua a data.
2.  **Resumo Geral**: Escreva um parágrafo inicial que resuma os principais resultados do dia (produção total, se a meta foi atingida, etc.).
3.  **Análise de Desempenho**:
    *   Calcule a média de peças por hora para cada função.
    *   Identifique a função mais produtiva e a menos produtiva.
    *   Identifique o trabalhador com a maior produção total (some as peças de todas as funções para cada trabalhador).
    *   Mencione quaisquer destaques positivos ou negativos no desempenho.
4.  **Análise de Paradas**:
    *   Some o total de minutos parados com base nas observações.
    *   Identifique as principais causas das paradas.
    *   Analise o impacto dessas paradas na produção.
5.  **Análise da Meta**:
    *   Compare o resultado da função final com a meta estabelecida.
    *   Informe claramente se a meta foi atingida, superada ou não alcançada, e por qual margem.
6.  **Recomendações e Pontos de Atenção**:
    *   Com base em sua análise, forneça de 2 a 4 recomendações práticas. Podem ser sobre alocação de pessoal, treinamento, manutenção de máquinas, ou otimização de processos.
    *   Aponte gargalos ou áreas que precisam de atenção gerencial.

Seja objetivo e baseie sua análise estritamente nos dados fornecidos. Responda apenas com o JSON de saída solicitado.`,
});

const generateDailyReportFlow = ai.defineFlow(
  {
    name: 'generateDailyReportFlow',
    inputSchema: GenerateDailyReportInputSchema,
    outputSchema: GenerateDailyReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
