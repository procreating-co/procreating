/**
 * Intent Engine — Fase 1 do "Cérebro do Procreating OS" (pedido explícito: "não usar LLM pra
 * aquilo que o próprio software consegue calcular"). Pergunta em português → reconhecida por
 * padrão (sem rede, sem custo, sem depender de crédito da Anthropic) → mapeada pra uma das
 * ferramentas determinísticas já existentes (`lib/ai/tools.ts`, todas consultam Supabase direto)
 * → resposta formatada por template, também sem LLM. Só quando NENHUM padrão bate é que o
 * orquestrador (`orchestrator.ts`) cai pro Claude — e mesmo assim usando as MESMAS ferramentas,
 * nunca um cálculo paralelo.
 *
 * Sem `"server-only"` de propósito (diferente de `tools.ts`/`orchestrator.ts`) — este arquivo é
 * lógica pura (regex + string), sem Supabase/segredo nenhum, mesmo raciocínio de
 * `lib/financeiro/calculations.ts`: só assim dá pra testar direto com Vitest
 * (`intent-engine.test.ts`), sem mock de servidor.
 *
 * Ordem dos padrões importa — mais específico primeiro (ex.: "meta" antes de "receita" genérico,
 * senão "quanto falta pra bater a meta" cairia em `get_financial_summary`).
 */

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, ""); // remove acentos — "está"/"esta", "é"/"e" tratados igual
}

type IntentRule = { tool: string; patterns: RegExp[] };

const INTENT_RULES: IntentRule[] = [
  {
    tool: "get_growth_target",
    patterns: [/quant(as|os) (vendas|clientes) (precisamos|falta)/, /o que precisa(mos)? pra bater/, /quanto (precisamos|falta) prospectar/],
  },
  {
    tool: "get_goal_progress",
    patterns: [
      /quanto falta.*meta/, /meta (mensal|do mes)/, /bater a meta/, /quanto (falta|resta) pra (a )?meta/,
      /(quantos dias|dias restantes).*mes/, /quanto falta (pra|para) r?\$/, /quanto (falta|resta) para \d/,
    ],
  },
  {
    // Checado ANTES de get_stale_leads/get_pipeline_summary — "quem está parado no pipeline" tem
    // as duas palavras, mas a intenção real é follow-up, não resumo de funil.
    tool: "get_stale_leads",
    patterns: [/sem (follow.?up|contato)/, /leads? parad/, /quem esta parad/, /precisam? de follow/],
  },
  {
    tool: "get_top_client",
    patterns: [/qual (o )?(maior )?cliente/, /maior cliente/, /cliente que mais (gera|fatura|paga)/, /cliente.*mais (receita|fatur)/, /top client/],
  },
  {
    tool: "get_overdue_accounts",
    patterns: [/atrasad[oa]/, /inadimplent/, /(quem|qual cliente) esta devendo/, /conta.*atras/],
  },
  {
    tool: "get_upcoming_receivables",
    patterns: [/vencendo/, /a receber (essa|nesta|na) semana/, /pr[oó]xim.*receb/, /vai vencer/],
  },
  {
    tool: "get_financial_summary",
    patterns: [
      /\bmrr\b/, /\barr\b/, /receita recorrente/, /receita (d[eo] )?m[eê]s/, /quanto fatur/, /resumo financeiro/,
      /margem/, /quanto (sobra|lucramos|lucro)/, /despesa/, /quanto gast/, /quanto temos (no banco|em caixa)/,
    ],
  },
  {
    tool: "get_pipeline_summary",
    patterns: [/pipeline/, /funil/, /quantos leads/, /taxa de convers[aã]o/, /taxa de fechamento/, /em negocia[cç][aã]o/],
  },
  {
    tool: "get_my_tasks_due",
    patterns: [/minhas tarefas/, /o que (eu )?tenho (pra|para) hoje/, /tarefas? (atrasad|vencendo|hoje|pendente)/],
  },
];

/** `null` = nenhum padrão determinístico bateu, orquestrador decide se cai pro Claude. */
export function matchIntent(question: string): string | null {
  const normalized = normalize(question);
  for (const rule of INTENT_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(normalized))) return rule.tool;
  }
  return null;
}

/**
 * Formata o resultado (já em português, chaves descritivas — ver `tools.ts`) numa frase curta,
 * sem LLM nenhum. Cada ferramenta tem seu próprio formato porque cada uma devolve uma forma
 * diferente — não dá pra genericalizar sem perder a resposta específica que a pergunta pedia.
 */
export function formatToolResult(toolName: string, result: unknown): string {
  const r = result as Record<string, unknown>;

  if (r && typeof r === "object" && "error" in r) return String(r.error);
  if (r && typeof r === "object" && "mensagem" in r && Object.keys(r).length <= 2) return String(r.mensagem);

  switch (toolName) {
    case "get_financial_summary":
      return `MRR: ${r.mrr}. Receita do mês: ${r.receitaDoMes}. Despesas do mês: ${r.despesasDoMes}. Margem: ${r.margem}.`;
    case "get_goal_progress":
      if (!r.definida) return String(r.mensagem);
      return `Meta: ${r.meta}. Realizado: ${r.realizado} (${r.percentualAtingido}). Restam ${r.restante} e ${r.diasRestantesNoMes} dias no mês.`;
    case "get_top_client":
      return `${r.cliente} — ${r.valor} este mês (${r.percentualDaReceitaDoMes} da receita do mês).`;
    case "get_growth_target":
      return `Faltam ${r.gapParaMeta} pra meta. Com o ticket médio deste mês (${r.ticketMedioDoMes}), isso é ${r.clientesNecessarios} cliente(s) novo(s).`;
    case "get_overdue_accounts": {
      const receivable = r.contasAReceberAtrasadas as { total: number };
      const payable = r.contasAPagarAtrasadas as { total: number };
      if (receivable.total === 0 && payable.total === 0) return "Nenhuma conta atrasada, nem a receber nem a pagar.";
      return `${receivable.total} conta(s) a receber atrasada(s), ${payable.total} conta(s) a pagar atrasada(s).`;
    }
    case "get_upcoming_receivables":
      return Number((r.itens as unknown[]).length) === 0
        ? `Nada a receber vencendo nos próximos ${r.janelaDias} dias.`
        : `${r.total} a receber nos próximos ${r.janelaDias} dias (${(r.itens as unknown[]).length} lançamento(s)).`;
    case "get_pipeline_summary":
      return `${r.leadsAbertos} lead(s) aberto(s), ${r.emNegociacao} em negociação, ${r.valorPipeline} em pipeline. Conversão: ${r.taxaConversao}.`;
    case "get_stale_leads":
      return Number(r.total) === 0 ? `Nenhum lead parado há mais de ${r.diasConsiderados} dias.` : `${r.total} lead(s) sem contato há mais de ${r.diasConsiderados} dias.`;
    case "get_my_tasks_due":
      return Number(r.total) === 0 ? "Nenhuma tarefa vencendo hoje ou atrasada." : `${r.total} tarefa(s) vencendo hoje ou atrasada(s).`;
    default:
      return JSON.stringify(result);
  }
}
