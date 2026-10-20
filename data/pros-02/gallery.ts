import type { GalleryFolderDef } from "@/lib/clients/types";

/**
 * A vitrine `/pros/02` não expõe galeria (`nav.showGallery = false`), mas o registro de cliente
 * (`lib/clients/registry.ts`) exige este export. Mantido vazio de propósito.
 */
export const galleryFolderDefs: GalleryFolderDef[] = [];
