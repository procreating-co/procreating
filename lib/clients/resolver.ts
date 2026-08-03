import type { ClientDataProvider } from "@/lib/clients/provider";
import type { ClientConfig, ClientVideos, GalleryFolderDef } from "@/lib/clients/types";

/**
 * Orquestra múltiplas fontes de dados de cliente, tentando cada uma em ordem até achar. É o
 * único lugar do projeto que sabe que mais de uma fonte pode existir — `registry.ts`
 * (`lib/clients/sources/registry-source.ts`) não sabe, e as rotas (`app/clients/[client]/**`) também
 * não, elas só conhecem `@/lib/clients`.
 *
 * Adicionar uma fonte nova (Supabase, cache, uma API futura) é uma linha na lista passada pro
 * construtor — zero mudança aqui dentro, em `registry.ts`, ou nas rotas.
 *
 * **Ainda não está ligado em `lib/clients/index.ts`.** Fazer isso trocaria as funções
 * exportadas de lá (`getClientConfig` etc., hoje síncronas) para assíncronas — porque uma
 * fonte de verdade (Supabase) exige `await` numa query. Isso obrigaria adicionar `await` nos
 * pontos de chamada dentro de `app/clients/[client]/**`, que são rota pública — mudança
 * comportamento-preservando, mas ainda assim uma edição em arquivo protegido nesta fase.
 * Fica pronto e correto aqui, ligar é decisão separada quando houver uma segunda fonte de
 * verdade pra justificar (ver `docs/project-creation.md`).
 */
export class ClientResolver implements ClientDataProvider {
  constructor(private readonly sources: ClientDataProvider[]) {}

  async getClientConfig(slug: string): Promise<ClientConfig | null> {
    for (const source of this.sources) {
      const config = await source.getClientConfig(slug);
      if (config) return config;
    }
    return null;
  }

  async getClientVideos(slug: string): Promise<ClientVideos | null> {
    for (const source of this.sources) {
      const videos = await source.getClientVideos(slug);
      if (videos) return videos;
    }
    return null;
  }

  async getClientGalleryFolderDefs(slug: string): Promise<GalleryFolderDef[] | null> {
    for (const source of this.sources) {
      const defs = await source.getClientGalleryFolderDefs(slug);
      if (defs) return defs;
    }
    return null;
  }

  async getRegisteredClientSlugs(): Promise<string[]> {
    const perSource = await Promise.all(this.sources.map((source) => source.getRegisteredClientSlugs()));
    return Array.from(new Set(perSource.flat()));
  }
}
