import type { InternalClient } from "@/lib/erp/clients/types";

/**
 * Contrato que toda fonte de dado de cliente do ERP interno satisfaz — mesma ideia de
 * `ClientDataProvider` (`lib/clients/provider.ts`, usado pela plataforma pública), copiada de
 * propósito em vez de importada: são domínios diferentes (ver `lib/erp/clients/types.ts`), e
 * cada um deve poder evoluir sem o outro precisar mudar.
 */
export interface ClientsProvider {
  listClients(): Promise<InternalClient[]>;
  getClientBySlug(slug: string): Promise<InternalClient | null>;
}
