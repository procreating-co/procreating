import type { GalleryFolderDef } from "@/lib/clients/types";

/**
 * Pastas ainda vazias — nenhuma foto real entregue ainda. Criar
 * `public/gallery/elenita/<id>/` e soltar arquivos dentro ativa a pasta automaticamente,
 * sem editar este arquivo de novo (mesmo padrão de `data/pascoal/gallery.ts`).
 */
export const galleryFolderDefs: GalleryFolderDef[] = [
  { id: "retratos", label: "Retratos" },
  { id: "consultorio", label: "Consultório" },
];
