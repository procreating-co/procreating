import type { GalleryFolderDef, GalleryPhoto } from "@/lib/clients/types";
import { r2Url } from "@/lib/r2";

/**
 * Galeria da Dra. Sandra servida direto do Cloudflare R2 (bucket público dedicado às fotos —
 * base distinta da dos vídeos). As fotos entram como `photos` explícitas na própria pasta, então
 * `getGalleryFolders` usa essas URLs em vez de ler o disco (ver `lib/gallery-server.ts`). O
 * otimizador do Next (`/_next/image`) redimensiona os JPEGs de câmera (~8MB) para AVIF/WebP
 * pequenos — por isso o host está liberado em `next.config.mjs` (`images.remotePatterns`).
 *
 * Pasta única (pedido): todas as fotos numa só categoria. Para dividir em Retratos/Instituto/
 * Procedimento/Equipe depois, basta criar mais entradas aqui com suas respectivas `photos`.
 */
const R2_GALLERY_BASE = "https://pub-267cc906483e43b1ab879e0a55228575.r2.dev";

const FILES = [
  "DSC00413.JPG",
  "DSC00428.JPG",
  "DSC00429.JPG",
  "DSC00430.JPG",
  "DSC00432.JPG",
  "DSC00433.JPG",
];

/** As 6 fotos da galeria (URLs do R2). Reusado pelo carrossel da Home em `config.ts`
 *  (fonte única — não duplicar a lista). */
export const galleryPhotos: GalleryPhoto[] = FILES.map((file, i) => ({
  src: r2Url(R2_GALLERY_BASE, file),
  alt: `Dra. Sandra Gomboski — foto ${String(i + 1).padStart(2, "0")}`,
}));

export const galleryFolderDefs: GalleryFolderDef[] = [
  {
    id: "galeria",
    label: "Galeria Dra. Sandra",
    photos: galleryPhotos,
  },
];
