import { parseQuickTask, type ParsedQuickTask, type QuickParseClient, type QuickParseTeamMember } from "@/lib/tasks/quick-parse";
import { parseTaskBatch, type ParsedTaskBatch } from "@/lib/tasks/batch-parse";

/**
 * Abstração de "IA" de tarefas (pedido explícito, §22) — a aplicação depende desta INTERFACE,
 * nunca da implementação concreta. Hoje só existe `RuleBasedTaskIntelligence` (determinístico,
 * `parseQuickTask`/`parseTaskBatch` por baixo — nenhuma chamada de rede, nenhum custo, nenhuma
 * dependência de LLM pago só pra interpretar "arrumar roteador amanhã"). Uma
 * `LLMTaskIntelligence` futura implementaria o MESMO contrato (`parse`) chamando um provider real
 * — nenhum outro arquivo deste sistema precisaria mudar, só a linha que escolhe qual
 * implementação usar (mesmo padrão de `lib/admin/auth`/`lib/clients/provider.ts` no resto do
 * projeto: contrato estável, implementação trocável).
 *
 * `suggest()`/`plan()`/`classify()` (citados no pedido) não têm implementação real ainda — ver
 * relatório final sobre o que ficou de fora desta rodada (Planejar meu dia, Strategies). Não
 * declarados aqui até terem um consumidor real (mesma regra já seguida no resto do projeto:
 * "não inventar abstração sem uso").
 */
export type TaskIntelligenceContext = {
  teamMembers: QuickParseTeamMember[];
  clients: QuickParseClient[];
};

export interface TaskIntelligence {
  /** Uma linha → uma intenção de tarefa. */
  parse(text: string, context: TaskIntelligenceContext): ParsedQuickTask;
  /** Várias linhas (com ou sem cabeçalho de grupo) → várias intenções, agrupadas ou soltas.
   *  `null` quando o texto não parece um lote (uma linha só) — quem chama cai pra `parse()`. */
  parseBatch(text: string, context: TaskIntelligenceContext): ParsedTaskBatch | null;
}

export const ruleBasedTaskIntelligence: TaskIntelligence = {
  parse(text, context) {
    return parseQuickTask(text, context.teamMembers, context.clients);
  },
  parseBatch(text, context) {
    return parseTaskBatch(text, context.teamMembers, context.clients);
  },
};

/** Única linha que troca quando um provider de LLM real entrar — mesma ideia de
 *  `lib/storage/index.ts`/`lib/admin/auth/index.ts`. */
export const taskIntelligence: TaskIntelligence = ruleBasedTaskIntelligence;
