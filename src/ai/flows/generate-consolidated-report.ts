'use server';

/**
 * @fileOverview Define um fluxo Genkit para gerar um relatório consolidado
 * para o administrador, analisando os dados de todos os perfis.
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
  reportDate: z.string().describe("A data para a qual o relatório está sendo gerado, no formato 'YYYY-MM-DD'."),
  allProfilesData: z
    .string()
    .describe(
      'Uma string JSON contendo um array, onde cada objeto representa um perfil e seus dados de produção para o dia. Ex: `[{"profileName": "Equipe A", "productionData": [{"name": "Costura", "workers":...}]}]`.'
    ),
});

export type GenerateConsolidatedReportInput = z.infer<
  typeof GenerateConsolidatedReportInputSchema
>;

/**
 * Schema de saída para o fluxo.
 */
const GenerateConsolidatedReportOutputSchema = z.object({
  reportTitle: z.string().describe("Um título para o relatório. Ex: 'Relatório Gerencial Consolidado - DD/MM/YYYY'"),
  overallSummary: z.string().describe('Um parágrafo curto com o resumo geral da produção de todos os perfis combinados.'),
  profileComparison: z.string().describe('Análise comparativa do desempenho de cada perfil (equipe), em markdown.'),
  functionAnalysis: z.string().describe('Análise das funções mais e menos produtivas, considerando dados de todos os perfis, em markdown.'),
  globalInsights: z.string().describe('Uma lista de insights estratégicos e pontos de atenção para o dono da empresa, em markdown.'),
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
  prompt: `Você é um Diretor de Operações (COO) de uma grande empresa de confecção, responsável por analisar a produtividade de todas as equipes. Sua tarefa é analisar os dados de produção consolidados de vários perfis (equipes) e gerar um relatório estratégico para o CEO.

Use um tom executivo, focado em métricas, comparações e insights de alto nível. Formate as seções de análise usando markdown simples (títulos com \`##\`, listas com \`*\`).

**Data do Relatório**: {{{reportDate}}}
**Dados Consolidados de Produção (de todos os perfis):**
{{{allProfilesData}}}

**Sua Tarefa:**

Analise os dados fornecidos e gere um relatório estratégico estruturado.

1.  **Título do Relatório**: Crie um título claro que inclua a data.
2.  **Resumo Geral (Overall Summary)**: Escreva um parágrafo inicial que resuma os resultados consolidados do dia (produção total da empresa, número de equipes ativas, principais destaques).
3.  **Análise Comparativa de Perfis (Profile Comparison)**:
    *   Calcule a produção total de cada perfil.
    *   Identifique o perfil mais produtivo e o menos produtivo.
    *   Compare a eficiência (média geral de peças/hora) entre os perfis.
    *   Mencione qualquer discrepância significativa no desempenho entre as equipes.
4.  **Análise Geral de Funções (Function Analysis)**:
    *   Analisando os dados de *toda* a empresa, identifique a função mais produtiva (maior média de peças/hora) e a menos produtiva.
    *   Identifique a função com o maior número de paradas registradas.
    *   Aponte possíveis gargalos no fluxo de produção com base na performance das funções.
5.  **Insights Globais (Global Insights)**:
    *   Com base em sua análise consolidada, forneça de 2 a 3 insights estratégicos.
    *   As recomendações podem ser sobre realocação de recursos entre equipes, padronização de processos que estão funcionando bem em uma equipe, ou investigação de problemas em equipes com baixo desempenho.
    *   Aponte tendências ou padrões que só são visíveis ao olhar para os dados de toda a empresa.

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
