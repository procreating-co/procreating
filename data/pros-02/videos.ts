import type { ClientVideos } from "@/lib/clients/types";
import { r2Url } from "@/lib/r2";

/**
 * Vitrine `/pros/02` — 3 vídeos da Dra. Sandra hospedados no bucket R2 `drasandra` (público).
 * Como `/pros/02` usa `videosSection.hideVideoMeta`, aparecem como 3 vídeos verticais clicáveis
 * lado a lado (sem número/título/download), só pra assistir.
 */
const R2_PUBLIC_BASE = "https://pub-efdfecafe11a4cb4aacac47948335da3.r2.dev";

export const clientVideos: ClientVideos = {
  socialVideos: [
    {
      id: "sandra-05-saude",
      number: "01",
      title: "O que você precisa saber sobre sua saúde antes de falar em procedimentos.",
      format: "vertical",
      poster: "",
      videoSrc: r2Url(R2_PUBLIC_BASE, "5. O que você precisa saber sobre sua saúde antes de falar em procedimentos.mp4"),
      downloadHref: r2Url(R2_PUBLIC_BASE, "5. O que você precisa saber sobre sua saúde antes de falar em procedimentos.mp4"),
      ready: true,
    },
    {
      id: "sandra-07-medo",
      number: "02",
      title: "Eu também tenho medo.",
      format: "vertical",
      poster: "",
      videoSrc: r2Url(R2_PUBLIC_BASE, "7. Eu também tenho medo.mp4"),
      downloadHref: r2Url(R2_PUBLIC_BASE, "7. Eu também tenho medo.mp4"),
      ready: true,
    },
    {
      id: "sandra-08-beleza",
      number: "03",
      title: "Por que eu não falo apenas de beleza.",
      format: "vertical",
      poster: "",
      videoSrc: r2Url(R2_PUBLIC_BASE, "8. Por que eu não falo apenas de beleza.mp4"),
      downloadHref: r2Url(R2_PUBLIC_BASE, "8. Por que eu não falo apenas de beleza.mp4"),
      ready: true,
    },
  ],
};
