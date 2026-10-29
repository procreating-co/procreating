import type { ClientVideos, GalleryVideo } from "@/lib/clients/types";
import { r2Url } from "@/lib/r2";
import { R2_PAMELA_BASE } from "./gallery";

/**
 * Vídeos da Dra. Pâmela.
 *  - `socialVideos`: vazio por enquanto → a Home mostra 3 slots "Em breve" (ver `config.ts`,
 *    `videosSection.production`). Quando houver vídeos sociais produzidos, adicione aqui.
 *  - `galleryVideos`: acervo bruto (46 clipes `.MOV`, prefixo `videos/` do bucket R2),
 *    exibido na Galeria (`/galeria`) pra cliente assistir e baixar em alta. Varredura verificada
 *    do bucket (MVI_0136→MVI_0540); `.MOV` toca inline no Safari/iOS e sempre pode ser baixado.
 */
const VIDEO_FILES = [
  "MVI_0136.MOV",
  "MVI_0137.MOV",
  "MVI_0145.MOV",
  "MVI_0146.MOV",
  "MVI_0147.MOV",
  "MVI_0148.MOV",
  "MVI_0149.MOV",
  "MVI_0150.MOV",
  "MVI_0151.MOV",
  "MVI_0188.MOV",
  "MVI_0189.MOV",
  "MVI_0190.MOV",
  "MVI_0191.MOV",
  "MVI_0192.MOV",
  "MVI_0193.MOV",
  "MVI_0194.MOV",
  "MVI_0195.MOV",
  "MVI_0196.MOV",
  "MVI_0197.MOV",
  "MVI_0461.MOV",
  "MVI_0462.MOV",
  "MVI_0463.MOV",
  "MVI_0464.MOV",
  "MVI_0465.MOV",
  "MVI_0466.MOV",
  "MVI_0467.MOV",
  "MVI_0468.MOV",
  "MVI_0469.MOV",
  "MVI_0470.MOV",
  "MVI_0471.MOV",
  "MVI_0472.MOV",
  "MVI_0492.MOV",
  "MVI_0493.MOV",
  "MVI_0494.MOV",
  "MVI_0495.MOV",
  "MVI_0496.MOV",
  "MVI_0497.MOV",
  "MVI_0517.MOV",
  "MVI_0519.MOV",
  "MVI_0520.MOV",
  "MVI_0521.MOV",
  "MVI_0522.MOV",
  "MVI_0523.MOV",
  "MVI_0524.MOV",
  "MVI_0537.MOV",
  "MVI_0540.MOV",
];

const galleryVideos: GalleryVideo[] = VIDEO_FILES.map((file) => ({
  src: r2Url(R2_PAMELA_BASE, `videos/${file}`),
  title: file.replace(/\.mov$/i, ""),
}));

export const clientVideos: ClientVideos = {
  socialVideos: [],
  galleryVideos,
};
