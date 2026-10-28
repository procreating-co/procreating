import type { GalleryFolderDef } from "@/lib/clients/types";

/**
 * Pastas da galeria da Dra. Pamela, na ordem de exibição. As fotos ainda NÃO foram subidas
 * (pedido: só a estrutura) — cada pasta tem um diretório correspondente em
 * `public/gallery/drapamela/<id>/` (vazio por enquanto). Basta soltar os arquivos de imagem lá
 * dentro depois; eles aparecem automaticamente (auto-descoberta via filesystem, ver
 * `lib/gallery-server.ts`).
 */
export const galleryFolderDefs: GalleryFolderDef[] = [
  { id: "retratos-pamela", label: "Retratos Dra. Pamela" },
  { id: "consultorio", label: "Consultório" },
  { id: "procedimento", label: "Procedimento" },
  { id: "equipe", label: "Equipe" },
];
