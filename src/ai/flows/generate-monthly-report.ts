'use server';

/**
 * @fileOverview Define um fluxo Genkit para gerar um relatório gerencial mensal
 * consolidando dados de produção de um mês inteiro.
 *
 * @exports {
 *   generateMonthlyReport: function
 *   GenerateMonthlyReportInput: type
 *   GenerateMonthlyReportOutput: type
 * }
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * Schema de entrada para o fluxo generateMonthlyReport.
 */
const GenerateMonthlyReportInputSchema = z.object({
  productionData: z
    .string()
    .describe(
      'Uma string JSON contendo um array de todos os dias de produção do mês. Ex: `[{"id": "2023-10-01", "functions": [...]}, {"id": "2023-10-02", ...}]`.'
    ),
  monthName: z.string().describe("O nome do mês para o relatório. Ex: 'Outubro de 2023'"),
});

export type GenerateMonthlyReportInput = z.infer<
  typeof GenerateMonthlyReportInputSchema
>;

/**
 * Schema de saída para o fluxo generateMonthlyReport.
 */
const GenerateMonthlyReportOutputSchema = z.object({
  reportTitle: z.string().describe("Um título para o relatório. Ex: 'Relatório Mensal de Produção - Outubro de 2023'"),
  summary: z.string().describe('Um resumo executivo do desempenho do mês, incluindo produção total, médias e principais destaques.'),
  performanceTrend: z.string().describe('Análise da tendência de produção ao longo do mês (crescimento, queda, estabilidade), em markdown.'),
  stoppageAnalysis: z.string().describe('Análise dos principais motivos de parada e seu impacto acumulado no mês, em markdown.'),
  recommendations: z.string().describe('Recomendações estratégicas de médio prazo baseadas nos dados do mês, em markdown.'),
});

export type GenerateMonthlyReportOutput = z.infer<
  typeof GenerateMonthlyReportOutputSchema
>;

/**
 * Chama o fluxo de IA para gerar um relatório mensal.
 *
 * @param {GenerateMonthlyReportInput} input - A entrada para o fluxo.
 * @returns {Promise<GenerateMonthlyReportOutput>} - O relatório gerado.
 */
export async function generateMonthlyReport(
  input: GenerateMonthlyReportInput
): Promise<GenerateMonthlyReportOutput> {
  return generateMonthlyReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMonthlyReportPrompt',
  input: {schema: GenerateMonthlyReportInputSchema},
  output: {schema: GenerateMonthlyReportOutputSchema},
  prompt: `Você é um Diretor de Produção experiente analisando o desempenho de um mês inteiro para planejar o próximo. Sua tarefa é analisar os dados consolidados de todos os dias de produção do mês e gerar um relatório estratégico.

Use um tom analítico e focado em tendências e planejamento de médio prazo.

**Mês do Relatório**: {{{monthName}}}
**Dados de Produção do Mês:**
{{{productionData}}}

**Sua Tarefa:**

Analise os dados e gere um relatório estruturado.

1.  **Título do Relatório**: Crie um título claro que inclua o mês.
2.  **Resumo Executivo**: Escreva um parágrafo que resuma a produção total do mês, a média diária de produção, e os principais marcos (positivos ou negativos).
3.  **Análise de Tendência de Desempenho**:
    *   Analise a evolução da produção ao longo das semanas. Houve crescimento, queda ou volatilidade?
    *   Identifique as funções que foram consistentemente mais ou menos produtivas ao longo do mês.
    *   Compare o desempenho da primeira quinzena com a segunda.
4.  **Análise de Paradas (Mensal)**:
    *   Some o total de minutos parados para cada motivo ao longo do mês.
    *   Identifique os 2-3 principais motivos de parada que mais impactaram a produção no período.
    *   Houve algum padrão nas paradas (ocorreram mais em certos dias da semana ou semanas do mês)?
5.  **Recomendações Estratégicas**:
    *   Com base na análise mensal, forneça de 2 a 3 recomendações para o próximo mês.
    *   Sugestões podem incluir foco em treinamento para funções de baixo desempenho, planejamento de manutenção preventiva para as causas de parada mais comuns, ou mudanças no fluxo de trabalho.

Seja objetivo e baseie sua análise estritamente nos dados fornecidos. Responda apenas com o JSON de saída solicitado.`,
});

const generateMonthlyReportFlow = ai.defineFlow(
  {
    name: 'generateMonthlyReportFlow',
    inputSchema: GenerateMonthlyReportInputSchema,
    outputSchema: GenerateMonthlyReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
