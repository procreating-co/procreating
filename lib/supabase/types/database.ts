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
// User — perfil do usuário do admin/ERP interno, vinculado ao `auth.users` do Supabase Auth
// (a linha em si não guarda senha/credencial — isso é o Supabase Auth que cuida). `role` é o
// vocabulário de papel de toda a plataforma (Fase 1, Foundation) — só gravado por enquanto, sem
// enforcement de RBAC granular por módulo ainda (ver docs/project-creation.md, seção 8/18).
// ---------------------------------------------------------------------------
export type UserRole = "owner" | "admin" | "commercial" | "marketing" | "operations" | "finance" | "production" | "client";

export type UserTheme = "light" | "dark";

export type User = {
  /** Mesmo `id` do `auth.users` correspondente. */
  id: string;
  name: string;
  email: string;
  role: UserRole;
  /** Preferência de tema salva — `null` = sem preferência ainda (resolvido via cookie ou "dark",
   *  ver `lib/theme/`). */
  theme: UserTheme | null;
  /** URL pública do bucket `avatars` (Supabase Storage) — `null` até o primeiro upload, cai no
   *  monograma do nome como fallback (sidebar, menu de conta). */
  avatar_url: string | null;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Client — a empresa/pessoa que contrata a Procreating (ex.: "Pascoal Bombas",
// "Dra. Elenita"). Existe uma vez só, independente de quantos projetos tiver. Fonte única de
// identidade de cliente pro ERP interno (`lib/erp/clients/`) E pra plataforma pública
// (`slug` bate com `lib/clients/registry.ts`/`workspace-registry.ts`) — ver "Auditoria
// Procreating OS", achado F.1, sobre a fragmentação que esta tabela resolve.
// ---------------------------------------------------------------------------
export type ClientStatus = "lead" | "onboarding" | "ativo" | "atencao" | "risco" | "churn";

export type Client = {
  id: string;
  name: string;
  slug: string;
  status: ClientStatus;
  document: string | null;
  segment: string | null;
  /** Estratégia comercial de origem (`Strategy`, abaixo) — `null` quando o cliente não veio de
   *  uma estratégia formal. Adicionado na migration de Comercial/Financeiro/Onboarding, pra essa
   *  estratégia continuar recebendo crédito pela receita gerada (ver `Lead.strategy_id`). */
  strategy_id: string | null;
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
  /** Bate com `ClientConfig.slug` / a pasta `data/<slug>/` / o segmento `/clients/<slug>`. */
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
// Event — Activity Log genérico (auditoria administrativa/sistema, baixo volume, sempre sabe
// quem/quando). Não confundir com Analytics/Downloads abaixo (visitante público, alto volume,
// sem actor_id).
//
// Generalizado na Fase 1 (Foundation): `entity_type`/`entity_id` substituem os antigos
// `project_id`/`client_id` — associação polimórfica deliberada (um evento aponta pra qualquer
// entidade futura — lead, opportunity, financial_rule, habit — sem FK por tipo). `type` deixou
// de ser union fechada no banco; os 9 valores abaixo continuam a convenção usada pelo domínio de
// projeto/deploy, só não são mais impostos por `check` (CRM/Financeiro/Pessoal registram os
// próprios tipos nas fases seguintes sem migration nova).
// ---------------------------------------------------------------------------
export type EventEntityType = "project" | "client" | string;

export type ProjectEventType =
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
  entity_type: EventEntityType;
  entity_id: string | null;
  /** `null` = ação do sistema, não de uma pessoa. */
  actor_id: string | null;
  type: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

// ---------------------------------------------------------------------------
// PipelineStage — funil comercial configurável (tabela, não union fechada — mesmo raciocínio de
// `lib/prospeccao/stages.ts`, migração Comercial/Financeiro/Onboarding). `is_won`/`is_lost`
// marcam os estágios terminais; o resto do código nunca compara `key === "fechado"` direto.
// ---------------------------------------------------------------------------
export type PipelineStage = {
  id: string;
  key: string;
  label: string;
  color: string;
  sort_order: number;
  is_won: boolean;
  is_lost: boolean;
  /** Probabilidade de fechamento desta etapa (0–100), pra "Weighted Pipeline" — `null` até
   *  alguém configurar (nunca um chute default). Sem editor nesta fase; a coluna já existe pronta
   *  pra quando isso for priorizado. */
  probability: number | null;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Strategy — definição de campanha/público-alvo comercial. Não confundir com
// `Strategy`/`StrategyCategory` de `lib/prospeccao/types.ts` (playbook de abordagem da Central de
// Prospecção da Pascoal, client-side, domínio totalmente diferente apesar do mesmo nome).
// ---------------------------------------------------------------------------
export type Strategy = {
  id: string;
  name: string;
  target_audience: string | null;
  segment: string | null;
  location: string | null;
  icp: string | null;
  qualification_criteria: string | null;
  offer: string | null;
  sales_pitch: string | null;
  prospecting_channel: string | null;
  prospecting_goal: number | null;
  meetings_goal: number | null;
  closing_goal: number | null;
  revenue_goal: number | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

// ---------------------------------------------------------------------------
// Lead — generalização de `Oficina` (`lib/prospeccao/types.ts`) pro CRM interno do ERP. Histórico
// de interação vive em `Event` (`entity_type: "lead"`), não numa tabela paralela.
// ---------------------------------------------------------------------------
export type Lead = {
  id: string;
  company_name: string;
  contact_name: string | null;
  role_title: string | null;
  whatsapp: string | null;
  email: string | null;
  source: string | null;
  strategy_id: string | null;
  potential_value: number | null;
  owner_id: string | null;
  stage_id: string;
  last_contact_at: string | null;
  next_contact_at: string | null;
  notes: string | null;
  /** Setado só na conversão via `close_lead_and_create_client` (RPC) — lead convertido nunca é
   *  reaberto/reutilizado por outro cliente. */
  client_id: string | null;
  created_at: string;
  updated_at: string;
};

// ---------------------------------------------------------------------------
// Contract / ContractScopeItem — Etapas 2 e 3 do modal de onboarding.
// ---------------------------------------------------------------------------
export type ContractType = "pontual" | "recorrente";
export type ContractStatus = "ativo" | "encerrado" | "cancelado";

export type Contract = {
  id: string;
  client_id: string;
  type: ContractType;
  status: ContractStatus;
  start_date: string;
  end_date: string | null;
  monthly_value: number | null;
  due_day: number | null;
  auto_renew: boolean;
  total_value: number | null;
  payment_terms: string | null;
  special_conditions: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type ContractScopeItem = {
  id: string;
  contract_id: string;
  service: string;
  quantity: number | null;
  frequency: string | null;
  deadline: string | null;
  notes: string | null;
  created_at: string;
};

// ---------------------------------------------------------------------------
// ClientOnboarding / ClientContact — Etapas 1 e 4 do modal.
// ---------------------------------------------------------------------------
export type ClientOnboarding = {
  id: string;
  client_id: string;
  legal_name: string | null;
  trade_name: string | null;
  cnpj: string | null;
  cpf: string | null;
  address: string | null;
  billing_info: string | null;
  objective: string | null;
  target_audience: string | null;
  offer: string | null;
  positioning: string | null;
  channels: string | null;
  goals: string | null;
  commercial_notes: string | null;
  created_by: string;
  created_at: string;
};

export type ClientContact = {
  id: string;
  client_id: string;
  name: string;
  role_title: string | null;
  email: string | null;
  whatsapp: string | null;
  is_primary: boolean;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Task — substitui `OnboardingTask` (Fase 2-5) nesta fase: "TASK é uma só", não uma entidade
// paralela por módulo. `context_type`/`context_id` são a mesma associação polimórfica de `Event`
// abaixo (sem FK, de propósito) — hoje só `context_type: "client_onboarding"` (RPC
// `close_lead_and_create_client`) é gravado; `context_type` nulo = tarefa solta (Meu Dia).
// ---------------------------------------------------------------------------
export type TaskStatus = "pending" | "in_progress" | "done";

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  assignee_id: string | null;
  due_date: string | null;
  context_type: string | null;
  context_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

// ---------------------------------------------------------------------------
// Revenue / Expense — Financeiro. `status` tem 4 valores de propósito (nunca um boolean
// pago/não-pago) — o que um fluxo de cobrança futuro (fora de escopo agora) vai precisar
// diferenciar sem migração de dado.
// ---------------------------------------------------------------------------
export type FinancialEntryStatus = "pendente" | "pago" | "atrasado" | "cancelado";

export type Revenue = {
  id: string;
  client_id: string | null;
  contract_id: string | null;
  description: string;
  amount: number;
  due_date: string;
  status: FinancialEntryStatus;
  paid_at: string | null;
  created_at: string;
};

export type Expense = {
  id: string;
  category: string;
  description: string;
  amount: number;
  due_date: string;
  status: FinancialEntryStatus;
  paid_at: string | null;
  created_by: string;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Cost — estrutura de custo fixo/variável da empresa (aluguel, ferramentas, pró-labore...). Não
// confundir com `Expense` acima: `Expense` é um lançamento datado com status de pagamento;
// `Cost` é a definição da estrutura, sem data/status individual — mesma relação conceitual que
// `Contract` tem com `Revenue` (definição vs. parcelas geradas). Não gera `Expense`
// automaticamente ainda.
// ---------------------------------------------------------------------------
export type CostRecurrence = "fixo" | "variavel";

export type Cost = {
  id: string;
  name: string;
  amount: number;
  category: string;
  recurrence: CostRecurrence;
  created_by: string;
  created_at: string;
  updated_at: string;
};

// ---------------------------------------------------------------------------
// FinancialRule / PartnerShare — a regra 20% operacional / 80% distribuível, centralizada (nunca
// hardcoded em componente — ver `lib/financeiro/rules.ts`, único lugar que lê isto).
// `PartnerShare` só existe pra sobrescrever o percentual de um sócio específico dentro dos 80%
// distribuíveis; sem nenhuma linha, a divisão é igual entre todo `User.role === "owner"`,
// calculada em runtime — não uma constante "50/50" gravada.
// ---------------------------------------------------------------------------
export type FinancialRule = {
  id: string;
  operational_percentage: number;
  created_at: string;
  updated_at: string;
};

export type PartnerShare = {
  id: string;
  user_id: string;
  percentage: number;
  created_at: string;
};

// ---------------------------------------------------------------------------
// RevenueGoal — meta mensal de faturamento da EMPRESA (não confundir com
// `Strategy.revenue_goal`, meta por campanha/estratégia). Uma linha por mês-calendário (`month`,
// sempre dia 1) — meses passados preservam a meta que valia na época mesmo que a meta futura
// mude. Sem linha pro mês corrente = Dashboard mostra "meta não definida", nunca inventa.
// ---------------------------------------------------------------------------
export type RevenueGoal = {
  id: string;
  month: string;
  amount: number;
  created_by: string;
  created_at: string;
  updated_at: string;
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
  /** Ex.: "/clients/pascoal/galeria". */
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
//
// `Relationships: []` é obrigatório pelo `GenericTable`/`GenericView` do `@supabase/postgrest-js`
// (ver `node_modules/@supabase/postgrest-js/dist/index.d.cts`) — sem ele, `Database` não bate
// estruturalmente com o que o client genérico espera, e toda query (`select`/`insert`/`update`)
// infere `never` silenciosamente em vez de dar erro claro no ponto certo. Array vazio é
// literalmente correto aqui: nenhuma tabela deste projeto é consultada via embed do PostgREST
// (`select("*, outra_tabela(*)")`) — todo join é feito manualmente em TypeScript, de propósito
// (ver comentário no topo de `lib/comercial/queries.ts`).
// ---------------------------------------------------------------------------
type TableDef<Row> = { Row: Row; Insert: Partial<Row>; Update: Partial<Row>; Relationships: [] };

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
      pipeline_stages: TableDef<PipelineStage>;
      strategies: TableDef<Strategy>;
      leads: TableDef<Lead>;
      contracts: TableDef<Contract>;
      contract_scope_items: TableDef<ContractScopeItem>;
      client_onboarding: TableDef<ClientOnboarding>;
      client_contacts: TableDef<ClientContact>;
      tasks: TableDef<Task>;
      revenue: TableDef<Revenue>;
      expenses: TableDef<Expense>;
      costs: TableDef<Cost>;
      financial_rules: TableDef<FinancialRule>;
      partner_shares: TableDef<PartnerShare>;
      revenue_goals: TableDef<RevenueGoal>;
    };
    Views: {
      /** `WHERE status IN ('published', 'archived')` — evita repetir esse filtro em toda
       *  consulta/dashboard que não deveria enxergar rascunhos. Ver docs/project-creation.md. */
      published_projects: { Row: Project; Relationships: [] };
    };
    Functions: {
      /** A transação real da Etapa 5 do onboarding — ver o comentário completo na migration
       *  `20260814000000_navigation_simulation_financeiro.sql` (versão corrente; a lógica nasceu
       *  em `20260813010000_comercial_financeiro_onboarding.sql`). Retorna o `id` do `Client`
       *  criado. */
      close_lead_and_create_client: {
        Args: { p_lead_id: string; p_payload: Record<string, unknown> };
        Returns: string;
      };
    };
  };
};
