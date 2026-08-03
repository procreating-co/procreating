import { pascoalPresentationEntry } from "@/content/clients/pascoal/public";
import { elenitaPresentation } from "@/content/clients/elenita/public";
import type { PresentationContent } from "@/lib/clients/presentation-types";

export type { PresentationContent, PresentationSection } from "@/lib/clients/presentation-types";

/**
 * Entrada do registry — dois formatos hoje:
 *  - "posicionamento-pro": delega pro pipeline legado (`ClientConfig` via `lib/clients`,
 *    `data/<slug>/**`, intocado). Só a Pascoal usa isto, e só ela deveria usar pra sempre — é o
 *    template fechado, não o generalizável.
 *  - "presentation": template novo, reutilizável, conteúdo mora em `content/clients/<slug>/
 *    public.ts` como `PresentationContent`.
 * Um cliente futuro com um template diferente (Portfolio, Landing Page) ganha um terceiro
 * formato aqui quando existir — não criado agora, sem cliente usando ainda.
 */
export type PresentationEntry =
  | { template: "posicionamento-pro"; slug: string }
  | { template: "presentation"; content: PresentationContent };

/**
 * Switchboard único pra `/clients/[client]/public/**` — mesmo padrão de
 * `lib/clients/workspace-registry.ts` e `lib/clients/registry.ts` (o legado, que este arquivo
 * não substitui, só passa a ser consultado a partir de uma entrada aqui em vez de ser o
 * caminho hardcoded da rota).
 */
const PRESENTATION_REGISTRY: Record<string, PresentationEntry> = {
  pascoal: pascoalPresentationEntry,
  elenita: { template: "presentation", content: elenitaPresentation },
};

export function getClientPresentation(slug: string): PresentationEntry | null {
  return PRESENTATION_REGISTRY[slug] ?? null;
}

/** Todos os slugs registrados — usado por `generateStaticParams` pra pré-gerar todo cliente, não só os legados. */
export function getAllPresentationSlugs(): string[] {
  return Object.keys(PRESENTATION_REGISTRY);
}
