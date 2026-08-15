import "server-only";
import { createClient } from "@/lib/supabase/server";
import { addDaysISO, calendarDateOf, todayISO } from "@/lib/date";
import type { SequenceStep } from "@/lib/supabase/types/database";
import type { LeadWithRelations } from "@/lib/comercial/types";

/**
 * Cadência de prospecção — MVP manual-assistido (decidido antes nesta sessão: sem disparo
 * automático, sem credencial de provedor ainda). `sequence_steps` é a CONFIGURAÇÃO por
 * estratégia; o progresso de cada lead na cadência não tem tabela própria — é derivado em
 * runtime de `events` (`type='sequence_step_completed'`), mesmo espírito de
 * `lib/comercial/funnel.ts` (calculado, não armazenado, decisão registrada lá). Isso evita uma
 * tabela de "enrollment" nova e reaproveita a camada de memória que já existe (auditoria §13:
 * "usar consistentemente" a camada de eventos em vez de criar uma paralela).
 */

export async function listSequenceSteps(strategyId: string): Promise<SequenceStep[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("sequence_steps").select("*").eq("strategy_id", strategyId).order("sort_order");
  return data ?? [];
}

async function listSequenceStepsByStrategies(strategyIds: string[]): Promise<Map<string, SequenceStep[]>> {
  const map = new Map<string, SequenceStep[]>();
  if (strategyIds.length === 0) return map;
  const supabase = await createClient();
  const { data } = await supabase.from("sequence_steps").select("*").in("strategy_id", strategyIds).order("sort_order");
  for (const step of data ?? []) {
    const list = map.get(step.strategy_id) ?? [];
    list.push(step);
    map.set(step.strategy_id, list);
  }
  return map;
}

export type SequenceProgress = { completedCount: number; firstContactISO: string | null };

/** Progresso derivado dos eventos `sequence_step_completed` — quantos passos já foram marcados
 *  como feitos (define QUAL passo vem a seguir) e quando foi o primeiro (âncora do `day_offset`,
 *  já que "dia 0" é sempre em relação ao primeiro contato, não à data em que o lead entrou no
 *  banco). */
export async function loadSequenceProgress(leadIds: string[]): Promise<Map<string, SequenceProgress>> {
  const map = new Map<string, SequenceProgress>();
  if (leadIds.length === 0) return map;
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("entity_id, created_at")
    .eq("entity_type", "lead")
    .eq("type", "sequence_step_completed")
    .in("entity_id", leadIds)
    .order("created_at", { ascending: true });
  for (const row of data ?? []) {
    if (!row.entity_id) continue; // nunca deveria acontecer (evento sempre grava entity_id) — só protege o tipo
    const current = map.get(row.entity_id) ?? { completedCount: 0, firstContactISO: null };
    current.completedCount += 1;
    if (!current.firstContactISO) current.firstContactISO = row.created_at;
    map.set(row.entity_id, current);
  }
  return map;
}

export type SuggestedAction = { step: SequenceStep; dueDateISO: string; overdue: boolean };

/** Próximo passo sugerido pra um lead, dado o progresso já feito — função pura, sem I/O (o
 *  mesmo padrão de `lib/simulation/engine.ts`). `null` quando a estratégia não tem cadência
 *  configurada ou quando os passos já acabaram (sequência esgotada, decisão de continuar fica
 *  manual). */
export function computeSuggestedAction(lead: { created_at: string }, steps: SequenceStep[], progress: SequenceProgress | undefined): SuggestedAction | null {
  if (steps.length === 0) return null;
  const sorted = [...steps].sort((a, b) => a.day_offset - b.day_offset);
  const completedCount = progress?.completedCount ?? 0;
  if (completedCount >= sorted.length) return null;
  const nextStep = sorted[completedCount];
  const anchorISO = calendarDateOf(progress?.firstContactISO ?? lead.created_at);
  const dueDateISO = addDaysISO(anchorISO, nextStep.day_offset);
  return { step: nextStep, dueDateISO, overdue: dueDateISO < todayISO() };
}

export type ExecutionQueueItem = { lead: LeadWithRelations; action: SuggestedAction };

/** Fila de execução — só leads com estratégia (sem estratégia não há cadência pra seguir, seria
 *  inventar sugestão) cuja próxima ação já vence hoje ou está atrasada. Atrasado primeiro. */
export async function computeExecutionQueue(leads: LeadWithRelations[]): Promise<ExecutionQueueItem[]> {
  const leadsWithStrategy = leads.filter((lead) => lead.strategy_id);
  const strategyIds = Array.from(new Set(leadsWithStrategy.map((lead) => lead.strategy_id as string)));
  const [stepsByStrategy, progressByLead] = await Promise.all([listSequenceStepsByStrategies(strategyIds), loadSequenceProgress(leadsWithStrategy.map((lead) => lead.id))]);

  const items: ExecutionQueueItem[] = [];
  for (const lead of leadsWithStrategy) {
    const steps = stepsByStrategy.get(lead.strategy_id as string) ?? [];
    const action = computeSuggestedAction(lead, steps, progressByLead.get(lead.id));
    if (action && action.dueDateISO <= todayISO()) items.push({ lead, action });
  }
  return items.sort((a, b) => a.action.dueDateISO.localeCompare(b.action.dueDateISO));
}
