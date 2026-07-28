export type ProjectStatus = "online" | "development" | "paused";

/**
 * Forma "achatada" pra UI do admin (cards, tabela) — não confundir com `ClientConfig`
 * (`lib/clients/types.ts`), que é o formato completo consumido pelas rotas públicas
 * `/p/[client]`. Quando a Etapa 3 (Supabase) conectar de verdade, isto é o shape que uma
 * query `clients` + agregados de analytics devem produzir.
 */
export type AdminProject = {
  id: string;
  slug: string;
  name: string;
  clientName: string;
  status: ProjectStatus;
  /** ISO 8601 */
  lastAccessAt: string;
  /** ISO 8601 */
  updatedAt: string;
  /** Total de visualizações — futuramente vem de `Analytics` (lib/supabase/types/database.ts). */
  views: number;
  /** Total de downloads — futuramente vem de `Download` (lib/supabase/types/database.ts). */
  downloads: number;
};
