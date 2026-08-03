import type { GalleryFolderDef } from "@/lib/clients/types";

/**
 * Pastas da galeria, na ordem de exibição. Para criar uma nova pasta, adicione uma
 * entrada aqui e crie o diretório correspondente em `public/gallery/elenita/`.
 */
export const galleryFolderDefs: GalleryFolderDef[] = [
  { id: "retratos-elenita", label: "Retratos Dra. Elenita" },
  { id: "consultorio", label: "Consultório" },
  { id: "procedimento", label: "Procedimento" },
  { id: "retratos-elenita-alexandre", label: "Retratos Dra. Elenita e Alexandre" },
];
