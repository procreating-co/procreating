/**
 * Contrato do Workspace interno (`/clients/[client]`, `components/workspace/**`) — não confundir
 * com `lib/clients/types.ts` (`ClientConfig`), que é o formato da entrega pública legada,
 * consumido só por `app/clients/[client]/public/**`. Cada cliente satisfaz este tipo em
 * `content/clients/<slug>/workspace.ts`; `lib/clients/workspace-registry.ts` é o único lugar que
 * conhece a lista completa (mesmo padrão de `lib/clients/registry.ts` pro pipeline legado).
 */
export type ClientTemplate = "Presentation" | "Portfolio" | "Landing Page";
export type ClientWorkspaceStatus = "Published" | "Draft" | "Archived";

/** Estado de um item do checklist de progresso — ver `ClientWorkspaceConfig.progress`. */
export type ProgressStepState = "done" | "in-progress" | "pending";

export type ProgressStep = {
  label: string;
  state: ProgressStepState;
};

/**
 * Ficha resumida do projeto — o card "Projeto" do Overview. Deliberadamente simples (sem prazos,
 * orçamento, etc.) até existir um projeto de verdade por trás; hoje é 1:1 com o workspace, mas o
 * shape já separa "projeto" de "cliente" pra quando um cliente tiver mais de uma entrega.
 */
export type WorkspaceProject = {
  name: string;
  status: string;
  type: ClientTemplate;
  deliverable: string;
};

export type ClientWorkspaceConfig = {
  slug: string;
  name: string;
  status: ClientWorkspaceStatus;
  template: ClientTemplate;
  /** Cor de identidade do cliente — reservada pro site público futuro; usada hoje só como um
   *  toque discreto no header do Workspace (nunca no chrome do admin em si). */
  accentColor: string;
  tagline: string;
  /** Data (ISO, `YYYY-MM-DD`) da última edição real deste arquivo de conteúdo — não é telemetria
   *  automática, é atualizada manualmente junto do resto do `workspace.ts` quando o dado muda. */
  updatedAt: string;
  project: WorkspaceProject;
  progress: ProgressStep[];
  nextSteps: string[];
  overview: {
    summary: string;
    highlights: string[];
  };
};
