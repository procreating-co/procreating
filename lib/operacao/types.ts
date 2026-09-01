import type { ProductionItemFormat, ProductionItemKind, ProductionProjectStatus } from "@/lib/supabase/types/database";
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

/**
 * Presets de status por `kind` de `production_items` — cada página (Produção/Entregas/Recursos)
 * tem seu próprio vocabulário (`status_label` é texto livre no banco, não um CHECK enum, ver
 * comentário da migration), mas a UI oferece uma lista fechada por página em vez de um campo de
 * texto livre — evita "Em produção"/"em produção"/"Produção" virarem 3 valores diferentes pro
 * mesmo estado.
 */
export type StatusPreset = { label: string; tone: StatusTone };

export const PRODUCTION_ITEM_STATUS_PRESETS: Record<ProductionItemKind, StatusPreset[]> = {
  producao: [
    { label: "Roteiro", tone: "pending" },
    { label: "Em produção", tone: "active" },
    { label: "Edição", tone: "active" },
    { label: "Revisão interna", tone: "pending" },
    { label: "Concluído", tone: "neutral" },
  ],
  entrega: [
    { label: "Em produção", tone: "pending" },
    { label: "Em revisão", tone: "active" },
    { label: "Aguardando aprovação", tone: "pending" },
    { label: "Aprovado", tone: "active" },
    { label: "Entregue", tone: "neutral" },
  ],
  // Estendido pro Client Hub (Cronograma de postagens/Roteiros/Stories, Operação > Clientes >
  // [cliente]) — pedido explícito do vocabulário de 6 estados; os 3 originais (Planejado/Em
  // produção/Publicado) continuam valendo pra quem já usa `/operacao/conteudo`, só ganharam mais
  // 3 opções no meio do fluxo. Nenhum item existente precisa mudar.
  conteudo: [
    { label: "Planejado", tone: "pending" },
    { label: "Em produção", tone: "active" },
    { label: "Em revisão", tone: "pending" },
    { label: "Aprovado", tone: "active" },
    { label: "Agendado", tone: "active" },
    { label: "Publicado", tone: "neutral" },
  ],
};

export const PRODUCTION_ITEM_KIND_LABEL: Record<ProductionItemKind, string> = {
  producao: "Conteúdo",
  entrega: "Entrega",
  conteudo: "Conteúdo",
};

/** Rótulo de `format` (Client Hub) — `null` mostra como "Post" (valor mais comum do Cronograma). */
export const PRODUCTION_ITEM_FORMAT_LABEL: Record<ProductionItemFormat, string> = {
  post: "Post",
  reels: "Reels",
  story: "Story",
  roteiro: "Roteiro",
  outro: "Outro",
};
