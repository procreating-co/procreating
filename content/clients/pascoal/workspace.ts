import type { ClientWorkspaceConfig } from "@/lib/clients/workspace-types";

/** Accent `#d4af6a` batendo com `data/pascoal/config.ts` — mesma identidade, fonte diferente. */
export const pascoalWorkspace: ClientWorkspaceConfig = {
  slug: "pascoal",
  name: "Pascoal Bombas",
  status: "Published",
  template: "Presentation",
  accentColor: "#d4af6a",
  tagline: "Posicionamento e aquisição para o setor de bombas industriais.",
  updatedAt: "2026-08-02",
  project: {
    name: "Pascoal Bombas — PosicionamentoPRO",
    status: "Publicado",
    type: "Presentation",
    deliverable: "Site de posicionamento e aquisição",
  },
  progress: [
    { label: "Estrutura inicial", state: "done" },
    { label: "Identidade visual", state: "done" },
    { label: "Conteúdo", state: "done" },
    { label: "Publicação", state: "done" },
  ],
  nextSteps: ["Nenhuma ação pendente — site no ar e operando"],
  overview: {
    summary:
      "Primeiro cliente da plataforma — site de posicionamento no ar, com vídeos de aquisição, galeria de fotos e central de prospecção ativa.",
    highlights: ["Site público no ar", "Galeria com senha", "Central de prospecção ativa"],
  },
};
