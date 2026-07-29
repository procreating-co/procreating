export type ProjectStatus = "online" | "development" | "paused";

/**
 * Forma "achatada" pra UI do admin (cards, tabela) — não confundir com `ClientConfig`
 * (`lib/clients/types.ts`), que é o formato completo consumido pelas rotas públicas
 * `/p/[client]`. Quando o Supabase conectar de verdade, isto é o shape que uma query
 * `projects` (`lib/supabase/types/database.ts`) + agregados de analytics devem produzir.
 *
 * Um projeto pertence a um `AdminClient` (`clientId`, `lib/admin/clients/types.ts`) e nasce de
 * um `AdminTemplate` (`templateId`, `lib/admin/templates/types.ts`) — um cliente pode ter
 * vários projetos.
 */
export type AdminProject = {
  id: string;
  /** Bate com a pasta `data/<slug>/` / o segmento `/p/<slug>` — só quando o projeto já está
   *  publicado de verdade (ex.: "pascoal"). Projetos ainda não publicados podem ter um slug
   *  reservado sem rota pública correspondente ainda. */
  slug: string;
  name: string;
  clientId: string;
  templateId: string;
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
