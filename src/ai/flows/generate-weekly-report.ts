'use server';

/**
 * @fileOverview Define um fluxo Genkit para gerar um relatório gerencial semanal
 * consolidando dados de produção de uma semana.
 *
 * @exports {
 *   generateWeeklyReport: function
 *   GenerateWeeklyReportInput: type
 *   GenerateWeeklyReportOutput: type
 * }
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * Schema de entrada para o fluxo generateWeeklyReport.
 */
const GenerateWeeklyReportInputSchema = z.object({
  productionData: z
    .string()
    .describe(
      'Uma string JSON contendo um array de todos os dias de produção da semana. Ex: `[{"id": "2023-10-23", "functions": [...]}, {"id": "2023-10-24", ...}]`.'
    ),
  weekPeriod: z.string().describe("O período da semana para o relatório. Ex: '23/10/2023 a 29/10/2023'"),
});

export type GenerateWeeklyReportInput = z.infer<
  typeof GenerateWeeklyReportInputSchema
>;

/**
 * Schema de saída para o fluxo generateWeeklyReport.
 */
const GenerateWeeklyReportOutputSchema = z.object({
  reportTitle: z.string().describe("Um título para o relatório. Ex: 'Relatório Semanal de Produção - 23/10 a 29/10'"),
  summary: z.string().describe('Um resumo geral do desempenho da semana, incluindo produção total e destaques.'),
  performanceByDay: z.string().describe('Análise de desempenho dia a dia da semana, identificando o dia mais e menos produtivo, em markdown.'),
  stoppageAnalysis: z.string().describe('Análise consolidada das paradas da semana e seus principais motivos, em markdown.'),
  recommendations: z.string().describe('Recomendações e pontos de atenção para a próxima semana, em markdown.'),
});

export type GenerateWeeklyReportOutput = z.infer<
  typeof GenerateWeeklyReportOutputSchema
>;

/**
 * Chama o fluxo de IA para gerar um relatório semanal.
 *
 * @param {GenerateWeeklyReportInput} input - A entrada para o fluxo.
 * @returns {Promise<GenerateWeeklyReportOutput>} - O relatório gerado.
 */
export async function generateWeeklyReport(
  input: GenerateWeeklyReportInput
): Promise<GenerateWeeklyReportOutput> {
  return generateWeeklyReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWeeklyReportPrompt',
  input: {schema: GenerateWeeklyReportInputSchema},
  output: {schema: GenerateWeeklyReportOutputSchema},
  prompt: `Você é um gerente de produção analisando os resultados de uma semana de trabalho para preparar a próxima. Sua tarefa é analisar os dados de produção de uma semana inteira e gerar um relatório gerencial.

Use um tom profissional e focado em padrões e recomendações para a próxima semana.

**Período da Semana**: {{{weekPeriod}}}
**Dados de Produção da Semana:**
{{{productionData}}}

**Sua Tarefa:**

Analise os dados e gere um relatório estruturado.

1.  **Título do Relatório**: Crie um título claro que inclua o período da semana.
2.  **Resumo Geral da Semana**: Escreva um parágrafo que resuma a produção total da semana, a média diária e os principais destaques (positivos ou negativos).
3.  **Análise de Desempenho por Dia**:
    *   Compare a produção total de cada dia da semana.
    *   Identifique o dia mais produtivo e o menos produtivo, e especule brevemente o porquê (se os dados sugerirem algo, como muitas paradas em um dia específico).
4.  **Análise de Paradas da Semana**:
    *   Some o total de minutos parados para os principais motivos ao longo da semana.
    *   Identifique os motivos de parada mais recorrentes.
5.  **Recomendações para a Próxima Semana**:
    *   Com base na análise da semana, forneça de 2 a 3 recomendações práticas.
    *   Podem ser sobre ajustar metas para certos dias, focar em resolver os principais motivos de parada, ou reconhecer o bom desempenho.

Seja objetivo e baseie sua análise estritamente nos dados fornecidos. Responda apenas com o JSON de saída solicitado.`,
});

const generateWeeklyReportFlow = ai.defineFlow(
  {
    name: 'generateWeeklyReportFlow',
    inputSchema: GenerateWeeklyReportInputSchema,
    outputSchema: GenerateWeeklyReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
