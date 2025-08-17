'use server';

/**
 * @fileOverview Define um fluxo Genkit para gerar um relatório consolidado
 * para o administrador, analisando os dados de todos os perfis em um determinado período.
 *
 * @exports {
 *   generateConsolidatedReport: function
 *   GenerateConsolidatedReportInput: type
 *   GenerateConsolidatedReportOutput: type
 * }
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * Schema de entrada para o fluxo.
 */
const GenerateConsolidatedReportInputSchema = z.object({
  reportPeriod: z.string().describe("O período que o relatório cobre. Ex: 'últimos 7 dias', 'mês de Outubro'."),
  allProfilesData: z
    .string()
    .describe(
      'Uma string JSON contendo um array, onde cada objeto representa um perfil e seus dados de produção para o período. Ex: `[{"profileName": "Equipe A", "productionData": [{"date": "2023-10-23", "functions": [...]}]}]`.'
    ),
});

export type GenerateConsolidatedReportInput = z.infer<
  typeof GenerateConsolidatedReportInputSchema
>;

/**
 * Schema de saída para o fluxo.
 */
const GenerateConsolidatedReportOutputSchema = z.object({
  reportTitle: z.string().describe("Um título para o relatório. Ex: 'Relatório Gerencial Consolidado - Últimos 7 dias'"),
  overallSummary: z.string().describe('Um parágrafo curto com o resumo geral da produção de todos os perfis combinados no período.'),
  profileComparison: z.string().describe('Análise comparativa do desempenho de cada perfil (equipe) no período, em markdown.'),
  functionAnalysis: z.string().describe('Análise das funções mais e menos produtivas, considerando dados de todos os perfis no período, em markdown.'),
  globalInsights: z.string().describe('Uma lista de insights estratégicos e pontos de atenção para o dono da empresa, baseados nas tendências do período, em markdown.'),
});

export type GenerateConsolidatedReportOutput = z.infer<
  typeof GenerateConsolidatedReportOutputSchema
>;

/**
 * Chama o fluxo de IA para gerar um relatório consolidado.
 *
 * @param {GenerateConsolidatedReportInput} input - A entrada para o fluxo.
 * @returns {Promise<GenerateConsolidatedReportOutput>} - O relatório gerado.
 */
export async function generateConsolidatedReport(
  input: GenerateConsolidatedReportInput
): Promise<GenerateConsolidatedReportOutput> {
  return generateConsolidatedReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateConsolidatedReportPrompt',
  input: {schema: GenerateConsolidatedReportInputSchema},
  output: {schema: GenerateConsolidatedReportOutputSchema},
  prompt: `Você é um Diretor de Operações (COO) de uma grande empresa de confecção, responsável por analisar a produtividade de todas as equipes. Sua tarefa é analisar os dados de produção consolidados de vários perfis (equipes) durante um período e gerar um relatório estratégico para o CEO.

Use um tom executivo, focado em métricas, comparações, tendências e insights de alto nível. Formate as seções de análise usando markdown simples (títulos com \`##\`, listas com \`*\`).

**Período do Relatório**: {{{reportPeriod}}}
**Dados Consolidados de Produção (de todos os perfis):**
{{{allProfilesData}}}

**Sua Tarefa:**

Analise os dados fornecidos e gere um relatório estratégico estruturado.

1.  **Título do Relatório**: Crie um título claro que inclua o período.
2.  **Resumo Geral (Overall Summary)**: Escreva um parágrafo inicial que resuma os resultados consolidados do período (produção total da empresa, número de equipes ativas, principais destaques e tendências observadas).
3.  **Análise Comparativa de Perfis (Profile Comparison)**:
    *   Calcule a produção total de cada perfil no período.
    *   Identifique o perfil mais produtivo e o menos produtivo.
    *   Compare a eficiência (média de peças/hora total) entre os perfis.
    *   Aponte se algum perfil demonstrou melhora ou piora significativa durante o período.
4.  **Análise Geral de Funções (Function Analysis)**:
    *   Analisando os dados de *toda* a empresa no período, identifique a função mais produtiva (maior média de peças/hora) e a menos produtiva.
    *   Identifique a função com o maior número de paradas registradas no total.
    *   Aponte possíveis gargalos ou tendências no fluxo de produção com base na performance das funções.
5.  **Insights Globais (Global Insights)**:
    *   Com base em sua análise consolidada, forneça de 2 a 3 insights estratégicos.
    *   As recomendações podem ser sobre realocação de recursos, padronização de processos de sucesso, ou investigação de problemas crônicos.
    *   Aponte tendências ou padrões que só são visíveis ao olhar para os dados de toda a empresa ao longo do tempo.

Seja objetivo e baseie sua análise estritamente nos dados fornecidos. Responda apenas com o JSON de saída solicitado.`,
});

const generateConsolidatedReportFlow = ai.defineFlow(
  {
    name: 'generateConsolidatedReportFlow',
    inputSchema: GenerateConsolidatedReportInputSchema,
    outputSchema: GenerateConsolidatedReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
