import { ClientResolver } from "@/lib/clients/resolver";
import { registrySource } from "@/lib/clients/sources/registry-source";
import type { ClientConfig, ClientVideos, GalleryFolderDef } from "@/lib/clients/types";

export type { ClientConfig, ClientVideos, GalleryFolderDef, VideoItem, ProspeccaoConfig } from "@/lib/clients/types";

/**
 * Único ponto de resolução de dados de cliente pras rotas públicas (`app/p/[client]/**`) — via
 * `ClientResolver` (`lib/clients/resolver.ts`), não mais lookup direto em `registry.ts`. Hoje
 * com uma única fonte (`registrySource`, adaptador de `registry.ts`); quando o Supabase
 * conectar, uma fonte nova entra na lista abaixo, sem tocar nenhuma rota — só este arquivo. Ver
 * `docs/project-creation.md`, seção 1.
 *
 * Assíncrono a partir de agora (antes era lookup síncrono em memória) — reflete que uma fonte
 * futura pode ser uma consulta de rede. Todo call site já é Server Component/`generateMetadata`/
 * `generateStaticParams` async, então a mudança em quem chama é só adicionar `await`.
 */
const resolver = new ClientResolver([registrySource]);

export function getClientConfig(slug: string): Promise<ClientConfig | null> {
  return resolver.getClientConfig(slug);
}

export function getClientVideos(slug: string): Promise<ClientVideos | null> {
  return resolver.getClientVideos(slug);
}

export function getClientGalleryFolderDefs(slug: string): Promise<GalleryFolderDef[] | null> {
  return resolver.getClientGalleryFolderDefs(slug);
}

export function getRegisteredClientSlugs(): Promise<string[]> {
  return resolver.getRegisteredClientSlugs();
}
