/**
 * Schema do banco — hoje é só o CONTRATO (nada conectado, nenhuma tabela criada ainda). Serve
 * pra tipar `createClient<Database>()` (`lib/supabase/client.ts`/`server.ts`) desde já, mesmo
 * sem projeto Supabase real por trás.
 *
 * Quando o schema existir de verdade num projeto Supabase, troque este arquivo pelo gerado via
 * `supabase gen types typescript` — o formato (`Database.public.Tables.<tabela>.Row/Insert/
 * Update`) é o mesmo, só fica mais preciso (nullability exata por coluna em vez da
 * aproximação `Partial<Row>` usada aqui pra `Insert`/`Update`).
 *
 * Ver `docs/supabase.md` pro esboço de schema em SQL e o plano de migração completo.
 */

// ---------------------------------------------------------------------------
// User — perfil do usuário do admin, vinculado ao `auth.users` do Supabase Auth
// (a linha em si não guarda senha/credencial — isso é o Supabase Auth que cuida).
// ---------------------------------------------------------------------------
export type UserRole = "admin" | "editor";

export type User = {
  /** Mesmo `id` do `auth.users` correspondente. */
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Client — um projeto/cliente (equivalente, no banco, ao que hoje é uma pasta
// `data/<slug>/` no template de arquivos). `config` guarda o resto do
// `ClientConfig` (hero, features, videosSection, footer, gallery, prospeccao)
// como jsonb — ver a nota sobre jsonb-vs-colunas em docs/supabase.md.
// ---------------------------------------------------------------------------
export type ClientStatus = "online" | "development" | "paused";

export type Client = {
  id: string;
  /** Bate com `ClientConfig.slug` / a pasta `data/<slug>/` / o segmento `/p/<slug>`. */
  slug: string;
  name: string;
  brand_name: string;
  status: ClientStatus;
  accent_color: string;
  /** Resto do `ClientConfig` — ver `lib/clients/types.ts`. */
  config: Record<string, unknown>;
  created_by: string;
  created_at: string;
  updated_at: string;
};

// ---------------------------------------------------------------------------
// Service — um produto contratado pelo cliente (checkboxes da Etapa 6: Vídeos,
// Fotos, Prospecção Ativa, Tráfego Pago). `enabled` controla se o módulo
// correspondente aparece pro cliente (mesma ideia do `prospeccao: null` de hoje,
// só que dirigido por linha de banco em vez de campo estático do config).
// ---------------------------------------------------------------------------
export type ServiceType = "videos" | "photos" | "active_prospecting" | "paid_traffic";

export type Service = {
  id: string;
  client_id: string;
  type: ServiceType;
  enabled: boolean;
  /** Specifics por tipo — ex.: `{ horizontalCount: 2, verticalCount: 3 }` pro tipo "videos". */
  config: Record<string, unknown>;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Video — uma linha por vídeo. `block` é o agrupamento que hoje existe em
// `ClientVideos` (socialVideos/acquisitionVideo/presentationVideo).
// `video_url`/`poster_url` apontam pro R2 (ver lib/storage, Etapa 4) — nunca
// pro Supabase Storage.
// ---------------------------------------------------------------------------
export type VideoFormat = "horizontal" | "vertical";
export type VideoBlock = "social" | "acquisition" | "presentation";

export type Video = {
  id: string;
  client_id: string;
  block: VideoBlock;
  number: string;
  title: string;
  short_title: string | null;
  format: VideoFormat;
  poster_url: string;
  video_url: string;
  download_url: string;
  ready: boolean;
  sort_order: number;
  created_at: string;
};

// ---------------------------------------------------------------------------
// GalleryFolder / GalleryFile — hoje as fotos vivem em
// `public/gallery/<slug>/<pasta>/` (filesystem, ver lib/gallery-server.ts).
// Estas duas tabelas são o caminho pra um dia migrar isso pro R2 + banco (não
// decidido ainda — ver a nota em docs/roadmap.md sobre a galeria continuar
// local até virar dor de verdade).
// ---------------------------------------------------------------------------
export type GalleryFolder = {
  id: string;
  client_id: string;
  /** Bate com o `id` em `GalleryFolderDef` (`lib/clients/types.ts`). */
  slug: string;
  label: string;
  sort_order: number;
  created_at: string;
};

export type GalleryFile = {
  id: string;
  folder_id: string;
  file_url: string;
  alt_text: string | null;
  sort_order: number;
  size_bytes: number | null;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Analytics — evento bruto (page view, desbloqueio de galeria/prospecção).
// A Etapa 8 é quem define as agregações (visitantes únicos, tempo médio etc.)
// em cima disso — aqui só o formato do evento individual.
// ---------------------------------------------------------------------------
export type AnalyticsEventType = "page_view" | "gallery_unlock" | "prospeccao_unlock";
export type AnalyticsDevice = "desktop" | "mobile" | "tablet";

export type Analytics = {
  id: string;
  client_id: string;
  event_type: AnalyticsEventType;
  /** Ex.: "/p/pascoal/galeria". */
  path: string;
  /** Hash anônimo (não é PII) — identifica visitante recorrente sem guardar IP/dado pessoal. */
  visitor_id: string | null;
  device: AnalyticsDevice | null;
  referrer: string | null;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Download — um download de vídeo ou foto.
// ---------------------------------------------------------------------------
export type DownloadResourceType = "video" | "photo";

export type Download = {
  id: string;
  client_id: string;
  resource_type: DownloadResourceType;
  /** `Video.id` ou `GalleryFile.id`, dependendo de `resource_type`. */
  resource_id: string;
  visitor_id: string | null;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Aproximação do formato gerado por `supabase gen types typescript`. `Insert`/
// `Update` aqui são só `Partial<Row>` — o gerado de verdade tem nullability
// exata por coluna (id/created_at opcionais no Insert, tudo opcional no
// Update). Trocar por esse quando o schema existir num projeto real.
// ---------------------------------------------------------------------------
type TableDef<Row> = { Row: Row; Insert: Partial<Row>; Update: Partial<Row> };

export type Database = {
  public: {
    Tables: {
      users: TableDef<User>;
      clients: TableDef<Client>;
      services: TableDef<Service>;
      videos: TableDef<Video>;
      gallery_folders: TableDef<GalleryFolder>;
      gallery_files: TableDef<GalleryFile>;
      analytics: TableDef<Analytics>;
      downloads: TableDef<Download>;
    };
  };
};
