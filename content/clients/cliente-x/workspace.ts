import type { ClientWorkspaceConfig } from "@/lib/clients/workspace-types";

/** Exemplo genérico — mantido no Hub pra sempre haver mais de um caso demonstrando busca/lista com 3+ itens. */
export const clienteXWorkspace: ClientWorkspaceConfig = {
  slug: "cliente-x",
  name: "Cliente X",
  status: "Draft",
  template: "Landing Page",
  accentColor: "#6b7280",
  tagline: "Exemplo — placeholder para demonstrar múltiplos workspaces.",
  updatedAt: "2026-08-02",
  project: {
    name: "Cliente X — Landing Page (demo)",
    status: "Exemplo",
    type: "Landing Page",
    deliverable: "Demo — sem entrega real",
  },
  progress: [
    { label: "Estrutura inicial", state: "pending" },
    { label: "Identidade visual", state: "pending" },
    { label: "Conteúdo", state: "pending" },
    { label: "Publicação", state: "pending" },
  ],
  nextSteps: ["Exemplo — sem cliente real, sem próximos passos"],
  overview: {
    summary: "Workspace de exemplo, sem cliente real por trás ainda.",
    highlights: ["Template Landing Page selecionado"],
  },
};
