import type { AdminProject } from "@/lib/admin/projects/types";

/**
 * Dados mockados — nenhuma consulta real acontece aqui, e isto NÃO importa de
 * `lib/clients/registry.ts` (o admin ainda não lê o template de verdade, ver Etapa 7 do
 * plano). "Pascoal Bombas" aparece só como exemplo realista; os demais são fictícios.
 */
export const mockProjects: AdminProject[] = [
  {
    id: "pascoal",
    slug: "pascoal",
    name: "Pascoal Bombas",
    clientName: "Pascoal Zona Sul Com. de Auto Peças",
    status: "online",
    lastAccessAt: "2026-07-28T14:32:00-03:00",
    updatedAt: "2026-07-28T09:10:00-03:00",
  },
  {
    id: "elenita",
    slug: "elenita",
    name: "Elenita Estética",
    clientName: "Elenita Estética Ltda.",
    status: "development",
    lastAccessAt: "2026-07-27T18:00:00-03:00",
    updatedAt: "2026-07-26T11:00:00-03:00",
  },
  {
    id: "grupo-vitoria",
    slug: "grupo-vitoria",
    name: "Grupo Vitória",
    clientName: "Grupo Vitória Comércio",
    status: "paused",
    lastAccessAt: "2026-07-10T10:00:00-03:00",
    updatedAt: "2026-07-15T16:00:00-03:00",
  },
  {
    id: "oficina-mmr",
    slug: "oficina-mmr",
    name: "Oficina MMR",
    clientName: "MMR Serviços Automotivos",
    status: "development",
    lastAccessAt: "2026-07-25T09:45:00-03:00",
    updatedAt: "2026-07-24T20:30:00-03:00",
  },
];
