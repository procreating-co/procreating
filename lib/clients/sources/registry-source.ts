import { getClientEntry, getRegisteredClientSlugs } from "@/lib/clients/registry";
import type { ClientDataProvider } from "@/lib/clients/provider";

/**
 * Adapta `registry.ts` (lookup em `data/<slug>/*.ts`, inalterado) pro formato `ClientDataProvider`
 * que o `ClientResolver` espera. `registry.ts` continua sem saber que isto existe — é este
 * arquivo que sabe sobre `registry.ts`, não o contrário.
 */
export const registrySource: ClientDataProvider = {
  getClientConfig: (slug) => getClientEntry(slug)?.config ?? null,
  getClientVideos: (slug) => getClientEntry(slug)?.videos ?? null,
  getClientGalleryFolderDefs: (slug) => getClientEntry(slug)?.galleryFolderDefs ?? null,
  getRegisteredClientSlugs: () => getRegisteredClientSlugs(),
};
