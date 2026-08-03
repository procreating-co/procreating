import type { ClientWorkspaceConfig } from "@/lib/clients/workspace-types";

/** Exemplo genérico — mantido no Hub pra sempre haver mais de um caso demonstrando busca/lista com 3+ itens. */
export const clienteXWorkspace: ClientWorkspaceConfig = {
  slug: "cliente-x",
  name: "Cliente X",
  status: "Draft",
  template: "Landing Page",
  accentColor: "#6b7280",
  tagline: "Exemplo — placeholder para demonstrar múltiplos workspaces.",
  overview: {
    summary: "Workspace de exemplo, sem cliente real por trás ainda.",
    highlights: ["Template Landing Page selecionado"],
  },
};
