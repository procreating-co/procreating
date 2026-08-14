import type {
  Client,
  ClientContact,
  ClientOnboarding,
  Contract,
  ContractScopeItem,
  Event,
  Task,
  Revenue,
  Strategy,
} from "@/lib/supabase/types/database";

/** Visão 360º de um cliente — tudo que a Seção 4 do briefing original pediu, junto: cadastro,
 *  contrato(s), escopo, financeiro, histórico, contatos, dados de onboarding herdados.
 *  `tasks` vem da tabela transversal `public.tasks` (`context_type: "client_onboarding"`), não
 *  de uma tabela própria — ver `lib/tasks/queries.ts`. */
export type ClientFull = {
  client: Client;
  strategy: Pick<Strategy, "id" | "name"> | null;
  onboarding: ClientOnboarding | null;
  contacts: ClientContact[];
  contracts: (Contract & { scopeItems: ContractScopeItem[] })[];
  revenue: Revenue[];
  tasks: Task[];
  events: Event[];
};
