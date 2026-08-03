import type { ClientWorkspaceConfig } from "@/lib/clients/workspace-types";

/**
 * Primeiro cliente criado sob a arquitetura multi-cliente — prova de que o Workspace é
 * reutilizável (mesmos componentes de `components/workspace/**`, só dado diferente aqui).
 * `public.ts` já existe e renderiza via `presentation-template.tsx` (seções dinâmicas), mas com
 * conteúdo de placeholder honesto — ver `progress`/`nextSteps` abaixo, que refletem isso.
 */
export const elenitaWorkspace: ClientWorkspaceConfig = {
  slug: "elenita",
  name: "Dra. Elenita Luzardo",
  status: "Draft",
  template: "Presentation",
  accentColor: "#b76e79",
  tagline: "Apresentação profissional — detalhes finais a definir com a cliente.",
  updatedAt: "2026-08-02",
  project: {
    name: "Dra. Elenita Luzardo — Presentation",
    status: "Em construção",
    type: "Presentation",
    deliverable: "Apresentação estratégica",
  },
  progress: [
    { label: "Estrutura inicial", state: "done" },
    { label: "Identidade visual", state: "done" },
    { label: "Conteúdo", state: "in-progress" },
    { label: "Publicação", state: "pending" },
  ],
  nextSteps: [
    "Receber fotos e vídeos reais da cliente",
    "Validar textos finais das seções com a cliente",
    "Publicar apresentação pública (mudar status para Published)",
  ],
  overview: {
    summary:
      "Workspace criado — apresentação pública já no ar em modo demo, aguardando fotos, vídeos e textos finais antes de publicar de verdade.",
    highlights: ["Template Presentation selecionado", "Apresentação pública em modo demo", "Aguardando conteúdo real da cliente"],
  },
};
