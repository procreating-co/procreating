import type { ClientsProvider } from "@/lib/erp/clients/provider";
import type { InternalClient } from "@/lib/erp/clients/types";

/**
 * Orquestra múltiplas fontes de cliente do ERP interno, tentando cada uma em ordem — mesmo
 * padrão de `ClientResolver` (`lib/clients/resolver.ts`, que serve a plataforma pública; ver o
 * comentário lá sobre por que cada domínio mantém sua própria cópia deste padrão em vez de
 * compartilhar uma implementação). Adicionar uma fonte nova (cache, uma API futura) é uma linha
 * na lista passada pro construtor — zero mudança aqui dentro nem em `index.ts`.
 */
export class ClientsResolver implements ClientsProvider {
  constructor(private readonly sources: ClientsProvider[]) {}

  async listClients(): Promise<InternalClient[]> {
    for (const source of this.sources) {
      const clients = await source.listClients();
      if (clients.length > 0) return clients;
    }
    return [];
  }

  async getClientBySlug(slug: string): Promise<InternalClient | null> {
    for (const source of this.sources) {
      const client = await source.getClientBySlug(slug);
      if (client) return client;
    }
    return null;
  }
}
