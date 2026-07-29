import type { AdminProject } from "@/lib/admin/projects/types";
import { slugify } from "@/lib/admin/format";

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
    status: "published",
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
    status: "draft",
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
    status: "ready_for_preview",
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
    status: "archived",
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
    status: "draft",
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

/** Todos os slugs já em uso — usado pelo passo "Projeto" do Wizard pra validar unicidade. */
export function getMockProjectSlugs(): string[] {
  return mockProjects.map((project) => project.slug);
}

/**
 * Cria um projeto e o adiciona à lista mock em memória — usado pela Server Action de conclusão
 * do Wizard (`app/admin/(protected)/projetos/novo/actions.ts`). Nesta fase o Wizard mock já
 * simula o pipeline completo (Draft → Preview → Deploy → Publicado, ver
 * `docs/project-creation.md` seção 19) então o projeto nasce direto com `status: "published"` —
 * não há Supabase/R2 reais por trás, só esta mutação de módulo em memória (some se o processo
 * do servidor reiniciar).
 */
export function createMockProject(input: {
  name: string;
  clientId: string;
  templateId: string;
}): AdminProject {
  const base = slugify(input.name);
  let slug = base || "projeto";
  let suffix = 2;
  while (mockProjects.some((project) => project.slug === slug)) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  const now = new Date().toISOString();
  const project: AdminProject = {
    id: slug,
    slug,
    name: input.name,
    clientId: input.clientId,
    templateId: input.templateId,
    status: "published",
    lastAccessAt: now,
    updatedAt: now,
    views: 0,
    downloads: 0,
  };
  mockProjects.push(project);
  return project;
}

/**
 * Marca um projeto como publicado — usado pela Etapa 7 (Publicação). Mutação in-place do mock
 * em memória (mesmo espírito de `createMockProject`); não mexe em `views`/`downloads` (isso é
 * Analytics, fora do escopo desta etapa).
 */
export function publishMockProject(id: string): AdminProject | null {
  const project = mockProjects.find((p) => p.id === id);
  if (!project) return null;
  const now = new Date().toISOString();
  project.status = "published";
  project.updatedAt = now;
  project.lastAccessAt = now;
  return project;
}
