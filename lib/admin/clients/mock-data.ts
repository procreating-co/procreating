import type { AdminClient } from "@/lib/admin/clients/types";
import { slugify } from "@/lib/admin/format";

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

/**
 * Cria um cliente e o adiciona à lista mock em memória — usado pelo passo "Cliente" do Wizard
 * (`app/admin/(protected)/projetos/novo/actions.ts`) quando o usuário escolhe "novo cliente" em
 * vez de um existente. Mutação de módulo, não banco — some se o processo do servidor reiniciar,
 * consistente com o resto deste mock.
 */
export function createMockClient(name: string): AdminClient {
  const base = slugify(name);
  let id = base || "cliente";
  let suffix = 2;
  while (mockClients.some((client) => client.id === id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  const client: AdminClient = { id, name, createdAt: new Date().toISOString() };
  mockClients.push(client);
  return client;
}
