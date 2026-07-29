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
 * (`lib/admin/{clients,projects,templates}/types.ts`). `previews` está documentada só em
 * `docs/project-creation.md` (pedido explícito de não criar o tipo ainda). Ver esse documento
 * pro desenho completo, diagramas e o raciocínio por trás de cada entidade.
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
// ---------------------------------------------------------------------------
export type Client = {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

// ---------------------------------------------------------------------------
// Template — o "molde" de um projeto (hoje só "PosicionamentoPRO"). `blocks` lista os tipos de
// bloco (`BlockType`, ver `lib/platform/blocks.ts`) que esse template usa. `version` sobe
// quando o conteúdo-padrão do template muda; `schema_version` sobe só se a FORMA do config
// mudar de verdade (raro). Nenhuma das duas afeta projeto já criado — `projects.config` é
// cópia, nunca referência viva ao template (ver docs/project-creation.md, seção Template).
// ---------------------------------------------------------------------------
export type Template = {
  id: string;
  slug: string;
  name: string;
  description: string;
  blocks: string[];
  version: number;
  schema_version: number;
  created_at: string;
  updated_at: string;
};

// ---------------------------------------------------------------------------
// Project — uma entrega concreta pra um cliente, a partir de um template. Equivalente, no
// banco, ao que hoje é uma pasta `data/<slug>/` no template de arquivos + uma linha em
// `lib/clients/registry.ts` (caminho que continua existindo só pra Pascoal). Um cliente pode
// ter vários projetos (`client_id` repetido).
// ---------------------------------------------------------------------------
export type ProjectStatus = "creating" | "draft" | "ready_for_preview" | "published" | "archived";

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
  /** Resto do config — ver `ProjectConfig`/`Block` em `lib/platform/blocks.ts`. */
  config: Record<string, unknown>;
  /** `null` até a primeira `project_versions` existir (status ainda "draft"). */
  current_version_id: string | null;
  /** `null` até o primeiro deploy bem-sucedido. */
  current_deployment_id: string | null;
  /** `null` = nunca expira (status published/archived). Ver política de expiração no doc. */
  expires_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

// ---------------------------------------------------------------------------
// ProjectVersion — snapshot imutável e append-only do config de um projeto num instante.
// Nunca dá UPDATE, só INSERT. `projects.current_version_id` aponta pra qual está "corrente".
// ---------------------------------------------------------------------------
export type ProjectVersion = {
  id: string;
  project_id: string;
  config: Record<string, unknown>;
  label: string | null;
  created_by: string;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Deployment — uma TENTATIVA de tornar uma versão específica a corrente. Separado de
// ProjectVersion de propósito: permite múltiplos deployments da mesma versão (retry, rollback,
// redeploy sem mudança de conteúdo), cada um com seu próprio histórico de sucesso/falha.
// ---------------------------------------------------------------------------
export type DeploymentStatus = "pending" | "in_progress" | "succeeded" | "failed";

export type Deployment = {
  id: string;
  project_id: string;
  version_id: string;
  status: DeploymentStatus;
  /** `null` = disparado pelo sistema (ex.: retry automático), não por uma pessoa. */
  triggered_by: string | null;
  error_message: string | null;
  started_at: string;
  finished_at: string | null;
};

// ---------------------------------------------------------------------------
// ProjectCapability — evolução do que antes se chamava "Service"/produto vendido. Generalizado
// pra caber em qualquer tipo de produto futuro (não só PosicionamentoPRO) — ver
// `lib/platform/capabilities.ts` pro catálogo com label/descrição de cada uma.
// ---------------------------------------------------------------------------
export type CapabilityKey =
  | "gallery"
  | "photos"
  | "videos"
  | "downloads"
  | "prospection"
  | "traffic"
  | "analytics"
  | "members_area"
  | "landing"
  | "password_protection"
  | "custom_modules";

export type ProjectCapability = {
  id: string;
  project_id: string;
  key: CapabilityKey;
  enabled: boolean;
  /** Specifics por capability — ex.: `{ horizontalCount: 2, verticalCount: 3 }` pra "videos". */
  config: Record<string, unknown>;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Asset — modelo UNIFICADO de mídia (substitui as antigas `Video`/`GalleryFolder`/
// `GalleryFile` desta mesma versão do schema — nenhuma delas chegou a ser usada por código
// real, então não há migração a fazer, só a decisão de nascer já assim). `category` é a chave
// de agrupamento que o Asset Manifest (`lib/platform/asset-manifest.ts`) usa pra organizar —
// ex.: "hero", "gallery:equipe", "social", "acquisition". Ver o ciclo de vida completo
// (`AssetStatus`) em `docs/project-creation.md`.
// ---------------------------------------------------------------------------
export type AssetType = "PHOTO" | "VIDEO" | "LOGO" | "PDF" | "DOCUMENT" | "ZIP" | "FILE" | "OTHER";

export type AssetStatus = "created" | "uploading" | "uploaded" | "processing" | "ready" | "archived" | "deleted" | "failed";

export type Asset = {
  id: string;
  project_id: string;
  type: AssetType;
  category: string;
  label: string;
  key: string;
  url: string;
  /** Campos específicos por tipo — ex.: `{ format: "vertical", ready: true }` pra vídeo. */
  metadata: Record<string, unknown>;
  status: AssetStatus;
  sort_order: number;
  size_bytes: number | null;
  created_by: string;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Event — auditoria de ações administrativas/sistema (baixo volume, sempre sabe quem/quando).
// Não confundir com Analytics/Downloads abaixo (visitante público, alto volume, sem actor_id) —
// ver a tabela de mapeamento em docs/project-creation.md.
// ---------------------------------------------------------------------------
export type EventType =
  | "project_created"
  | "project_updated"
  | "deploy_performed"
  | "preview_created"
  | "upload_started"
  | "upload_completed"
  | "password_changed"
  | "project_published"
  | "project_archived";

export type Event = {
  id: string;
  project_id: string | null;
  client_id: string | null;
  /** `null` = ação do sistema, não de uma pessoa. */
  actor_id: string | null;
  type: EventType;
  metadata: Record<string, unknown>;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Analytics — evento bruto de VISITANTE (page view, desbloqueio de galeria/prospecção), por
// projeto. Alto volume — em produção real, os cards de dashboard devem ler de uma tabela de
// rollup (`project_daily_stats`, esboçada em docs/project-creation.md), nunca somar isto direto.
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
  /** Segundos na página — preenchido por um evento `page_leave` futuro; `null` até existir. */
  duration_seconds: number | null;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Download — um download de asset, por projeto.
// ---------------------------------------------------------------------------
export type Download = {
  id: string;
  project_id: string;
  /** `Asset.id`. */
  asset_id: string;
  visitor_id: string | null;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Aproximação do formato gerado por `supabase gen types typescript`. `Insert`/`Update` aqui
// são só `Partial<Row>` — o gerado de verdade tem nullability exata por coluna. Trocar por esse
// quando o schema existir num projeto real.
// ---------------------------------------------------------------------------
type TableDef<Row> = { Row: Row; Insert: Partial<Row>; Update: Partial<Row> };

export type Database = {
  public: {
    Tables: {
      users: TableDef<User>;
      clients: TableDef<Client>;
      templates: TableDef<Template>;
      projects: TableDef<Project>;
      project_versions: TableDef<ProjectVersion>;
      deployments: TableDef<Deployment>;
      project_capabilities: TableDef<ProjectCapability>;
      assets: TableDef<Asset>;
      events: TableDef<Event>;
      analytics: TableDef<Analytics>;
      downloads: TableDef<Download>;
    };
    Views: {
      /** `WHERE status IN ('published', 'archived')` — evita repetir esse filtro em toda
       *  consulta/dashboard que não deveria enxergar rascunhos. Ver docs/project-creation.md. */
      published_projects: { Row: Project };
    };
  };
};
