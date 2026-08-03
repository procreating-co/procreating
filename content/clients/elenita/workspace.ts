import type { ClientWorkspaceConfig } from "@/lib/clients/workspace-types";

/**
 * Primeiro cliente criado sob a arquitetura multi-cliente — prova de que o Workspace é
 * reutilizável (mesmos componentes de `components/workspace/**`, só dado diferente aqui).
 * Site público ainda não existe (`/clients/elenita/public` segue 404 até `data/elenita/*`
 * existir e `elenita` entrar em `lib/clients/registry.ts` — decisão futura, fora desta etapa).
 */
export const elenitaWorkspace: ClientWorkspaceConfig = {
  slug: "elenita",
  name: "Dra. Elenita Luzardo",
  status: "Draft",
  template: "Presentation",
  accentColor: "#b76e79",
  tagline: "Apresentação profissional — detalhes finais a definir com a cliente.",
  overview: {
    summary:
      "Workspace criado — aguardando fotos, vídeos e textos finais antes de gerar a primeira versão pública.",
    highlights: ["Template Presentation selecionado", "Aguardando conteúdo", "Site público ainda não publicado"],
  },
};
