import type { ClientConfig, ClientVideos, GalleryFolderDef } from "@/lib/clients/types";

/**
 * Contrato que a camada de carregamento de clientes precisa satisfazer — hoje implementado
 * por `lib/clients/index.ts` (lookup em `data/<slug>/*.ts` via `lib/clients/registry.ts`),
 * amanhã por uma versão que consulta o Supabase (ver `docs/supabase.md`).
 *
 * Isto NÃO integra o Supabase — é só o contrato documentado, para que a troca futura da
 * origem dos dados seja mecânica: escrever um objeto que satisfaça esta interface e trocar o
 * import em `lib/clients/index.ts`. Nenhum componente importa isto diretamente; todos
 * consomem `getClientConfig`/`getClientVideos`/`getClientGalleryFolderDefs` de
 * `@/lib/clients`, então a troca de implementação é invisível pra eles.
 */
export interface ClientDataProvider {
  /** `null` se o slug não existe — quem chama decide o que fazer (ex.: `notFound()`). */
  getClientConfig(slug: string): ClientConfig | null | Promise<ClientConfig | null>;
  getClientVideos(slug: string): ClientVideos | null | Promise<ClientVideos | null>;
  getClientGalleryFolderDefs(slug: string): GalleryFolderDef[] | null | Promise<GalleryFolderDef[] | null>;
  /** Usado por `generateStaticParams` nas rotas `/clients/[client]/...` para pré-gerar as páginas. */
  getRegisteredClientSlugs(): string[] | Promise<string[]>;
}
