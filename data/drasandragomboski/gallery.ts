import type { GalleryFolderDef, GalleryPhoto } from "@/lib/clients/types";
import { r2Url } from "@/lib/r2";

/**
 * Galeria da Dra. Sandra servida direto do Cloudflare R2 (bucket público dedicado às fotos —
 * base distinta da dos vídeos). As fotos entram como `photos` explícitas na própria pasta, então
 * `getGalleryFolders` usa essas URLs em vez de ler o disco (ver `lib/gallery-server.ts`). O
 * otimizador do Next (`/_next/image`) redimensiona os JPEGs de câmera para AVIF/WebP pequenos —
 * por isso o host está liberado em `next.config.mjs` (`images.remotePatterns`).
 *
 * Pasta única (pedido): todas as 59 fotos numa só categoria, sem subpastas. A Galeria do site
 * detecta pasta única e mostra tudo numa grade plana (ver `components/gallery/gallery-experience.tsx`).
 *
 * HOME x GALERIA: o carrossel da Home usa só as 6 fotos "destaque" (`HOME_FILES`, as DSC), enquanto
 * a Galeria mostra as 59 (`GALLERY_FILES`). Mantém a Home enxuta e a Galeria completa (pedido).
 */
const R2_GALLERY_BASE = "https://pub-267cc906483e43b1ab879e0a55228575.r2.dev";

/** 6 fotos destaque, exibidas no carrossel da Home (config.ts). */
const HOME_FILES = [
  "DSC00413.JPG",
  "DSC00428.JPG",
  "DSC00429.JPG",
  "DSC00430.JPG",
  "DSC00432.JPG",
  "DSC00433.JPG",
];

/** Ensaio completo (Canon `_MG_####`), em ordem numérica — 53 fotos. */
const MG_FILES = [
  "_MG_9463.JPG", "_MG_9464.JPG", "_MG_9465.JPG", "_MG_9466.JPG", "_MG_9467.JPG",
  "01_MG_9468.JPG", "_MG_9469.JPG", "_MG_9470.JPG", "_MG_9471.JPG", "_MG_9472.JPG",
  "_MG_9473.JPG", "_MG_9474.JPG", "_MG_9475.JPG", "_MG_9476.JPG", "_MG_9477.JPG",
  "_MG_9478.JPG", "_MG_9479.JPG", "_MG_9480.JPG", "_MG_9481.JPG", "_MG_9482.JPG",
  "_MG_9483.JPG", "_MG_9484.JPG", "_MG_9485.JPG", "_MG_9486.JPG", "_MG_9487.JPG",
  "_MG_9488.JPG", "_MG_9489.JPG", "_MG_9490.JPG", "_MG_9491.JPG", "_MG_9492.JPG",
  "_MG_9493.JPG", "_MG_9494.JPG", "_MG_9495.JPG", "_MG_9496.JPG", "_MG_9497.JPG",
  "_MG_9498.JPG", "_MG_9499.JPG", "_MG_9500.JPG", "_MG_9501.JPG", "_MG_9510.JPG",
  "_MG_9511.JPG", "_MG_9512.JPG", "_MG_9513.JPG", "_MG_9514.JPG", "_MG_9515.JPG",
  "_MG_9516.JPG", "_MG_9517.JPG", "_MG_9518.JPG", "_MG_9519.JPG", "_MG_9520.JPG",
  "_MG_9521.JPG", "_MG_9522.JPG", "_MG_9523.JPG",
];

/** Galeria completa = 6 destaque (DSC) + 53 do ensaio (_MG_) = 59 fotos. */
const GALLERY_FILES = [...HOME_FILES, ...MG_FILES];

function toPhotos(files: string[]): GalleryPhoto[] {
  return files.map((file, i) => ({
    src: r2Url(R2_GALLERY_BASE, file),
    alt: `Dra. Sandra Gomboski — foto ${String(i + 1).padStart(2, "0")}`,
  }));
}

/** Fotos do carrossel da Home (6 destaque). Reusado em `config.ts` (fonte única). */
export const galleryPhotos: GalleryPhoto[] = toPhotos(HOME_FILES);

export const galleryFolderDefs: GalleryFolderDef[] = [
  {
    id: "galeria",
    label: "Galeria Dra. Sandra",
    photos: toPhotos(GALLERY_FILES),
  },
];
