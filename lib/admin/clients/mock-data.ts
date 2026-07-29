import type { AdminClient } from "@/lib/admin/clients/types";

/** Dados mockados — nenhuma consulta real. IDs referenciados por `lib/admin/projects/mock-data.ts`. */
export const mockClients: AdminClient[] = [
  { id: "pascoal-bombas", name: "Pascoal Bombas", createdAt: "2026-06-01T10:00:00-03:00" },
  { id: "dra-elenita", name: "Dra. Elenita", createdAt: "2026-07-01T10:00:00-03:00" },
  { id: "grupo-vitoria", name: "Grupo Vitória", createdAt: "2026-05-15T10:00:00-03:00" },
  { id: "oficina-mmr", name: "Oficina MMR", createdAt: "2026-07-20T10:00:00-03:00" },
];

/** Lookup simples pra UI (tabela/cards de projeto mostrando o nome do cliente dono). */
export function getMockClientName(clientId: string): string {
  return mockClients.find((client) => client.id === clientId)?.name ?? "Cliente desconhecido";
}

/** Um cliente por id — usado em `/admin/clientes/[id]`. */
export function getMockClientById(id: string): AdminClient | null {
  return mockClients.find((client) => client.id === id) ?? null;
}
