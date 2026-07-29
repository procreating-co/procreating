import type { AdminProject } from "@/lib/admin/projects/types";

/**
 * Dados mockados — nenhuma consulta real acontece aqui, e isto NÃO importa de
 * `lib/clients/registry.ts` (o admin ainda não lê o template de verdade). O projeto "pascoal"
 * é o único com `slug` correspondendo a uma rota pública de verdade (`/p/pascoal`); os demais
 * (inclusive o segundo projeto da Pascoal Bombas, "Landing Institucional") são fictícios,
 * usados aqui só pra mostrar um cliente com mais de um projeto.
 */
export const mockProjects: AdminProject[] = [
  {
    id: "pascoal",
    slug: "pascoal",
    name: "Posicionamento 2026",
    clientId: "pascoal-bombas",
    templateId: "posicionamento-pro",
    status: "online",
    lastAccessAt: "2026-07-28T14:32:00-03:00",
    updatedAt: "2026-07-28T09:10:00-03:00",
    views: 12480,
    downloads: 1032,
  },
  {
    id: "pascoal-landing",
    slug: "pascoal-landing",
    name: "Landing Institucional",
    clientId: "pascoal-bombas",
    templateId: "posicionamento-pro",
    status: "development",
    lastAccessAt: "2026-07-20T11:00:00-03:00",
    updatedAt: "2026-07-22T15:00:00-03:00",
    views: 0,
    downloads: 0,
  },
  {
    id: "elenita",
    slug: "elenita",
    name: "Posicionamento 2026",
    clientId: "dra-elenita",
    templateId: "posicionamento-pro",
    status: "development",
    lastAccessAt: "2026-07-27T18:00:00-03:00",
    updatedAt: "2026-07-26T11:00:00-03:00",
    views: 340,
    downloads: 12,
  },
  {
    id: "grupo-vitoria",
    slug: "grupo-vitoria",
    name: "Posicionamento 2026",
    clientId: "grupo-vitoria",
    templateId: "posicionamento-pro",
    status: "paused",
    lastAccessAt: "2026-07-10T10:00:00-03:00",
    updatedAt: "2026-07-15T16:00:00-03:00",
    views: 890,
    downloads: 54,
  },
  {
    id: "oficina-mmr",
    slug: "oficina-mmr",
    name: "Posicionamento 2026",
    clientId: "oficina-mmr",
    templateId: "posicionamento-pro",
    status: "development",
    lastAccessAt: "2026-07-25T09:45:00-03:00",
    updatedAt: "2026-07-24T20:30:00-03:00",
    views: 156,
    downloads: 3,
  },
];

/** Todos os projetos de um cliente — usado em `/admin/clientes/[id]`. */
export function getMockProjectsByClient(clientId: string): AdminProject[] {
  return mockProjects.filter((project) => project.clientId === clientId);
}

/** Um projeto por id — usado em `/admin/projetos/[id]`. */
export function getMockProjectById(id: string): AdminProject | null {
  return mockProjects.find((project) => project.id === id) ?? null;
}
