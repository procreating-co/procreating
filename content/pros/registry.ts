import { oficinasProsContent, type ProsContent } from "@/content/pros/oficinas";

/**
 * Switchboard de `/pros/[slug]` — mesmo padrão de `lib/clients/presentation-registry.ts`: um
 * slug novo = um `content/pros/<nome>.ts` novo + uma linha aqui, nunca uma rota nova.
 */
const PROS_REGISTRY: Record<string, ProsContent> = {
  "01": oficinasProsContent,
};

export function getProsContent(slug: string): ProsContent | null {
  return PROS_REGISTRY[slug] ?? null;
}

export function getAllProsSlugs(): string[] {
  return Object.keys(PROS_REGISTRY);
}
