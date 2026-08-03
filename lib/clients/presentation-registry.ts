import { elenitaPresentation } from "@/content/clients/elenita/public";
import type { PresentationContent } from "@/lib/clients/presentation-types";

export type { PresentationContent, PresentationSection } from "@/lib/clients/presentation-types";

/**
 * Switchboard do template Presentation — mesmo padrão de `lib/clients/workspace-registry.ts` e
 * `lib/clients/registry.ts` (o legado). A Pascoal não entra aqui: ela usa o pipeline
 * `ClientConfig` (`lib/clients/registry.ts`), intocado. Cliente novo com template Presentation =
 * uma pasta em `content/clients/<slug>/public.ts` + uma linha aqui.
 */
const PRESENTATION_REGISTRY: Record<string, PresentationContent> = {
  elenita: elenitaPresentation,
};

export function getClientPresentation(slug: string): PresentationContent | null {
  return PRESENTATION_REGISTRY[slug] ?? null;
}
