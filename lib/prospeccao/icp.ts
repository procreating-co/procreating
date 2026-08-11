import type { AderenciaIcp } from "@/lib/prospeccao/types";

/**
 * Fonte única da classificação de ICP (perfil de cliente ideal) — mesma convenção de
 * `stages.ts`. Alta/Média/Baixa ajudam a equipe a priorizar quem abordar primeiro; nenhuma
 * delas é motivo pra não importar o lead (ver `lib/prospeccao/csv.ts`).
 */
export const ICP_ORDER: AderenciaIcp[] = ["alta", "media", "baixa", "nao_classificado"];

export const ICP_LABEL: Record<AderenciaIcp, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
  nao_classificado: "Não classificado",
};

export const ICP_BADGE_CLASSES: Record<AderenciaIcp, string> = {
  alta: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
  media: "border-amber-500/25 bg-amber-500/10 text-amber-400",
  baixa: "border-white/15 bg-white/[0.04] text-white/45",
  nao_classificado: "border-white/10 bg-white/[0.02] text-white/25",
};

export const ICP_OPTIONS: { value: AderenciaIcp; label: string }[] = ICP_ORDER.map((value) => ({
  value,
  label: ICP_LABEL[value],
}));
