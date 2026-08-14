import type { ProductionProjectStatus } from "@/lib/supabase/types/database";
import type { StatusTone } from "@/components/dashboard/status-dot";

export const PRODUCTION_PROJECT_STATUSES: ProductionProjectStatus[] = [
  "planejamento",
  "em_producao",
  "em_revisao",
  "aguardando_aprovacao",
  "concluido",
  "atrasado",
];

export const PRODUCTION_PROJECT_STATUS_LABEL: Record<ProductionProjectStatus, string> = {
  planejamento: "Planejamento",
  em_producao: "Em produção",
  em_revisao: "Em revisão",
  aguardando_aprovacao: "Aguardando aprovação",
  concluido: "Concluído",
  atrasado: "Atrasado",
};

export const PRODUCTION_PROJECT_STATUS_TONE: Record<ProductionProjectStatus, StatusTone> = {
  planejamento: "neutral",
  em_producao: "active",
  em_revisao: "pending",
  aguardando_aprovacao: "pending",
  concluido: "active",
  atrasado: "danger",
};
