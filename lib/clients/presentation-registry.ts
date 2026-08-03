import { pascoalPresentationEntry } from "@/content/clients/pascoal/public";
import { elenitaPresentationEntry } from "@/content/clients/elenita/public";
import type { PresentationContent } from "@/lib/clients/presentation-types";

export type { PresentationContent, PresentationSection, PresentationSectionType } from "@/lib/clients/presentation-types";

/**
 * Entrada do registry — dois formatos possíveis:
 *  - "posicionamento-pro": delega pro pipeline legado (`ClientConfig` via `lib/clients`,
 *    `data/<slug>/**`, intocado). Pascoal e Elenita usam este hoje (pivô explícito: a entrega da
 *    Elenita passa a ter a mesma arquitetura da Pascoal).
 *  - "presentation": template de seções dinâmicas (`components/presentation/*Section.tsx`),
 *    conteúdo em `content/clients/<slug>/public.ts` como `PresentationContent`. Nenhum cliente
 *    usa hoje, mas fica disponível pra um cliente futuro cujo formato não seja o de posicionamento
 *    single-page (Portfolio, Landing Page).
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
  elenita: elenitaPresentationEntry,
};

export function getClientPresentation(slug: string): PresentationEntry | null {
  return PRESENTATION_REGISTRY[slug] ?? null;
}

/** Todos os slugs registrados — usado por `generateStaticParams` pra pré-gerar todo cliente, não só os legados. */
export function getAllPresentationSlugs(): string[] {
  return Object.keys(PRESENTATION_REGISTRY);
}
