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
 * Modelo em 3 níveis — Cliente → Projeto → Template — igual ao vocabulário do admin
 * (`lib/admin/{clients,projects,templates}/types.ts`). Ver `docs/supabase.md` pro plano de
 * migração completo.
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
// Client — a empresa/pessoa que contrata a Procreating (ex.: "Pascoal Bombas",
// "Dra. Elenita"). Existe uma vez só, independente de quantos projetos tiver.
// Deliberadamente minimalista — sem contato/endereço/etc. até existir uso real
// pra esses campos.
// ---------------------------------------------------------------------------
export type Client = {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

// ---------------------------------------------------------------------------
// Template — o "molde" de um projeto (hoje só "PosicionamentoPRO"). `blocks`
// lista as seções que esse template inclui (hero, features, videosSection,
// gallery, prospeccao, footer — mesmo vocabulário de `ClientConfig`,
// lib/clients/types.ts). Os componentes React de cada bloco são reaproveitados
// entre templates; o que muda por template é só quais blocos entram.
// ---------------------------------------------------------------------------
export type Template = {
  id: string;
  slug: string;
  name: string;
  description: string;
  blocks: string[];
  created_at: string;
};

// ---------------------------------------------------------------------------
// Project — uma entrega concreta pra um cliente, a partir de um template.
// Equivalente, no banco, ao que hoje é uma pasta `data/<slug>/` no template de
// arquivos + uma linha em `lib/clients/registry.ts`. Um cliente pode ter vários
// projetos (`client_id` repetido). `config` guarda o resto do `ClientConfig`
// (hero, features, videosSection, footer, gallery, prospeccao) como jsonb — ver
// a nota sobre jsonb-vs-colunas em docs/supabase.md.
//
// ATENÇÃO: esta tabela se chamava `clients` numa versão anterior deste schema —
// foi renomeada pra `projects` porque o que ela descreve (slug, config, cor,
// status de publicação) é sempre por-projeto, nunca por-empresa-cliente. Ver
// a nota de migração no fim deste arquivo.
// ---------------------------------------------------------------------------
export type ProjectStatus = "online" | "development" | "paused";

export type Project = {
  id: string;
  client_id: string;
  template_id: string;
  /** Bate com `ClientConfig.slug` / a pasta `data/<slug>/` / o segmento `/p/<slug>`. */
  slug: string;
  name: string;
  brand_name: string;
  status: ProjectStatus;
  accent_color: string;
  /** Resto do `ClientConfig` — ver `lib/clients/types.ts`. */
  config: Record<string, unknown>;
  created_by: string;
  created_at: string;
  updated_at: string;
};

// ---------------------------------------------------------------------------
// Service — um produto contratado NUM PROJETO (checkboxes: Vídeos, Fotos,
// Prospecção Ativa, Tráfego Pago). `enabled` controla se o módulo
// correspondente aparece nesse projeto (mesma ideia do `prospeccao: null` de
// hoje, só que dirigido por linha de banco em vez de campo estático do config).
// ---------------------------------------------------------------------------
export type ServiceType = "videos" | "photos" | "active_prospecting" | "paid_traffic";

export type Service = {
  id: string;
  project_id: string;
  type: ServiceType;
  enabled: boolean;
  /** Specifics por tipo — ex.: `{ horizontalCount: 2, verticalCount: 3 }` pro tipo "videos". */
  config: Record<string, unknown>;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Video — um vídeo pertence a um PROJETO específico (o site que o exibe), não
// à empresa-cliente em abstrato — se um cliente tiver 2 projetos, os vídeos de
// cada um são diferentes. `block` é o agrupamento que hoje existe em
// `ClientVideos` (socialVideos/acquisitionVideo/presentationVideo).
// `video_url`/`poster_url` apontam pro R2 (ver lib/storage) — nunca pro
// Supabase Storage.
// ---------------------------------------------------------------------------
export type VideoFormat = "horizontal" | "vertical";
export type VideoBlock = "social" | "acquisition" | "presentation";

export type Video = {
  id: string;
  project_id: string;
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
// local até virar dor de verdade). `GalleryFolder` também é por-projeto.
// ---------------------------------------------------------------------------
export type GalleryFolder = {
  id: string;
  project_id: string;
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
// Analytics — evento bruto (page view, desbloqueio de galeria/prospecção),
// por projeto. A Etapa 8 (analytics) é quem define as agregações (visitantes
// únicos, tempo médio etc.) em cima disso — aqui só o formato do evento
// individual.
// ---------------------------------------------------------------------------
export type AnalyticsEventType = "page_view" | "gallery_unlock" | "prospeccao_unlock";
export type AnalyticsDevice = "desktop" | "mobile" | "tablet";

export type Analytics = {
  id: string;
  project_id: string;
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
// Download — um download de vídeo ou foto, por projeto.
// ---------------------------------------------------------------------------
export type DownloadResourceType = "video" | "photo";

export type Download = {
  id: string;
  project_id: string;
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
      templates: TableDef<Template>;
      projects: TableDef<Project>;
      services: TableDef<Service>;
      videos: TableDef<Video>;
      gallery_folders: TableDef<GalleryFolder>;
      gallery_files: TableDef<GalleryFile>;
      analytics: TableDef<Analytics>;
      downloads: TableDef<Download>;
    };
  };
};
