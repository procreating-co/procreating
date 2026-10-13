import type { GalleryFolderDef } from "@/lib/clients/types";

/**
 * Pastas da galeria, na ordem de exibição. As fotos entram em
 * `public/gallery/drasandragomboski/<id>/` (auto-descoberta via filesystem) — as pastas já
 * existem vazias, é só soltar os arquivos. Ajuste/renomeie as pastas conforme a entrega real.
 */
export const galleryFolderDefs: GalleryFolderDef[] = [
  { id: "retratos-sandra", label: "Retratos Dra. Sandra" },
  { id: "instituto", label: "Instituto" },
  { id: "procedimento", label: "Procedimento" },
  { id: "equipe", label: "Equipe" },
];
