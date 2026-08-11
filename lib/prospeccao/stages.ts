import type { OficinaStage } from "@/lib/prospeccao/types";

/**
 * Fonte única do funil — ordem, rótulo e cor de cada etapa. Oficinas (tabela/filtro) e Gestão
 * (colunas do Kanban) leem daqui, nunca duplicam a lista. Mudar uma etapa é mudar só este array.
 */
export const STAGE_ORDER: OficinaStage[] = [
  "contato",
  "abordado",
  "em_conversa",
  "follow_up",
  "oportunidade",
  "parceiro",
  "sem_interesse",
  "perdido",
];

export const STAGE_LABEL: Record<OficinaStage, string> = {
  contato: "Contato",
  abordado: "Abordado",
  em_conversa: "Em conversa",
  follow_up: "Follow-up",
  oportunidade: "Oportunidade",
  parceiro: "Parceiro",
  sem_interesse: "Sem interesse",
  perdido: "Perdido",
};

/** Descrição curta de cada etapa — usada como legenda no Kanban. */
export const STAGE_DESCRIPTION: Record<OficinaStage, string> = {
  contato: "Ainda não prospectado",
  abordado: "Primeiro contato realizado",
  em_conversa: "Houve resposta ou interação",
  follow_up: "Aguardando retorno",
  oportunidade: "Existe interesse comercial",
  parceiro: "Já é parceiro da Pascoal",
  sem_interesse: "Sem interesse no momento",
  perdido: "Lead encerrado",
};

/** Badge/pill (fundo + borda + texto) — mesmo tom em qualquer lugar que mostre o status. */
export const STAGE_BADGE_CLASSES: Record<OficinaStage, string> = {
  contato: "border-white/15 bg-white/[0.04] text-white/50",
  abordado: "border-sky-500/25 bg-sky-500/10 text-sky-400",
  em_conversa: "border-violet-500/25 bg-violet-500/10 text-violet-400",
  follow_up: "border-amber-500/25 bg-amber-500/10 text-amber-400",
  oportunidade: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
  parceiro: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
  sem_interesse: "border-white/15 bg-white/[0.03] text-white/40",
  perdido: "border-red-500/25 bg-red-500/10 text-red-400",
};

/** Só a cor do ponto — usada em contextos compactos (ex.: cabeçalho de coluna do Kanban). */
export const STAGE_DOT_CLASSES: Record<OficinaStage, string> = {
  contato: "bg-white/40",
  abordado: "bg-sky-400",
  em_conversa: "bg-violet-400",
  follow_up: "bg-amber-400",
  oportunidade: "bg-emerald-400",
  parceiro: "bg-emerald-300",
  sem_interesse: "bg-white/30",
  perdido: "bg-red-400",
};

export const STAGE_OPTIONS: { value: OficinaStage; label: string }[] = STAGE_ORDER.map((value) => ({
  value,
  label: STAGE_LABEL[value],
}));
