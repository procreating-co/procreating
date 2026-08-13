import type {
  Client,
  ClientContact,
  ClientOnboarding,
  Contract,
  ContractScopeItem,
  Event,
  OnboardingTask,
  Revenue,
  Strategy,
} from "@/lib/supabase/types/database";

/** Visão 360º de um cliente — tudo que a Seção 4 do briefing original pediu, junto: cadastro,
 *  contrato(s), escopo, financeiro, histórico, contatos, dados de onboarding herdados. */
export type ClientFull = {
  client: Client;
  strategy: Pick<Strategy, "id" | "name"> | null;
  onboarding: ClientOnboarding | null;
  contacts: ClientContact[];
  contracts: (Contract & { scopeItems: ContractScopeItem[] })[];
  revenue: Revenue[];
  tasks: OnboardingTask[];
  events: Event[];
};
