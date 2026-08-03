/**
 * Contrato do Workspace interno (`/clients/[client]`, `components/workspace/**`) — não confundir
 * com `lib/clients/types.ts` (`ClientConfig`), que é o formato da entrega pública legada,
 * consumido só por `app/clients/[client]/public/**`. Cada cliente satisfaz este tipo em
 * `content/clients/<slug>/workspace.ts`; `lib/clients/workspace-registry.ts` é o único lugar que
 * conhece a lista completa (mesmo padrão de `lib/clients/registry.ts` pro pipeline legado).
 */
export type ClientTemplate = "Presentation" | "Portfolio" | "Landing Page";
export type ClientWorkspaceStatus = "Published" | "Draft" | "Archived";

export type ClientWorkspaceConfig = {
  slug: string;
  name: string;
  status: ClientWorkspaceStatus;
  template: ClientTemplate;
  /** Cor de identidade do cliente — reservada pro site público futuro; usada hoje só como um
   *  toque discreto no header do Workspace (nunca no chrome do admin em si). */
  accentColor: string;
  tagline: string;
  overview: {
    summary: string;
    highlights: string[];
  };
};
