export type LauncherClientStatus = "Published" | "Draft" | "Archived";

export type LauncherClient = {
  slug: string;
  name: string;
  status: LauncherClientStatus;
};

/**
 * Mock — `/clients` (o launcher, `components/clients/client-command.tsx`) ainda não lê nenhuma
 * fonte real. Candidatos naturais quando isso trocar: `lib/clients/registry.ts` (via
 * `getRegisteredClientSlugs()` + `getClientConfig()` pra name) ou, futuramente, um Client
 * Resolver Supabase-backed — nenhum dos dois hoje produz um `status` como este, então esse
 * campo também precisa de uma fonte real (provavelmente `AdminProject.status`, ver
 * `lib/admin/projects/types.ts`) antes de deixar de ser mock. `ClientCommand` só espera um
 * array de `LauncherClient` — de onde vem é decisão de outra hora.
 */
export const mockLauncherClients: LauncherClient[] = [
  { slug: "pascoal", name: "Pascoal Bombas", status: "Published" },
  { slug: "elenita", name: "Dra. Elenita", status: "Published" },
  { slug: "cliente-x", name: "Cliente X", status: "Draft" },
];
