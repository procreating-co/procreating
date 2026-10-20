import type { ClientVideos } from "@/lib/clients/types";
import { r2Url } from "@/lib/r2";

/**
 * Vitrine `/pros/02` — grade 3×3 (ver `videosSection.production` em `config.ts`):
 *  - posições 01-03: os 3 vídeos da Dra. Elenita (locais em `public/videos/`, mesmos de `/pros/01`);
 *  - posições 04-06: 3 vídeos da Dra. Sandra, hospedados no bucket R2 `drasandra` (público);
 *  - posições 07-09: ficam "Em breve" (3 espaços reservados), preenchidas depois.
 * A posição de cada vídeo na grade vem do seu `number` (ver `ProductionSlots`).
 */
const R2_PUBLIC_BASE = "https://pub-efdfecafe11a4cb4aacac47948335da3.r2.dev";

export const clientVideos: ClientVideos = {
  socialVideos: [
    // --- Linha 1: Dra. Elenita (vídeos locais, mesmos de /pros/01) ---
    {
      id: "elenita-01-protocolo-elleve",
      number: "01",
      title: "Protocolo Elleve",
      format: "vertical",
      poster: "/images/gallery/elenita-video-protocolo-elleve.jpg",
      videoSrc: "/videos/elenita-social-01-protocolo-elleve.mp4",
      downloadHref: "/videos/elenita-social-01-protocolo-elleve.mp4",
      ready: true,
    },
    {
      id: "elenita-02-priorizar",
      number: "02",
      title: "Você decidiu se priorizar.",
      format: "vertical",
      poster: "/images/gallery/elenita-video-priorizar.jpg",
      videoSrc: "/videos/elenita-social-02-voce-decidiu-se-priorizar.mp4",
      downloadHref: "/videos/elenita-social-02-voce-decidiu-se-priorizar.mp4",
      ready: true,
    },
    {
      id: "elenita-03-educativo",
      number: "03",
      title: "Educativo",
      format: "vertical",
      poster: "/images/gallery/elenita-video-educativo.jpg",
      videoSrc: "/videos/elenita-social-03-educativo.mp4",
      downloadHref: "/videos/elenita-social-03-educativo.mp4",
      ready: true,
    },
    // --- Linha 2: Dra. Sandra (R2) ---
    {
      id: "sandra-05-saude",
      number: "04",
      title: "O que você precisa saber sobre sua saúde antes de falar em procedimentos.",
      format: "vertical",
      poster: "",
      videoSrc: r2Url(R2_PUBLIC_BASE, "5. O que você precisa saber sobre sua saúde antes de falar em procedimentos.mp4"),
      downloadHref: r2Url(R2_PUBLIC_BASE, "5. O que você precisa saber sobre sua saúde antes de falar em procedimentos.mp4"),
      ready: true,
    },
    {
      id: "sandra-07-medo",
      number: "05",
      title: "Eu também tenho medo.",
      format: "vertical",
      poster: "",
      videoSrc: r2Url(R2_PUBLIC_BASE, "7. Eu também tenho medo.mp4"),
      downloadHref: r2Url(R2_PUBLIC_BASE, "7. Eu também tenho medo.mp4"),
      ready: true,
    },
    {
      id: "sandra-08-beleza",
      number: "06",
      title: "Por que eu não falo apenas de beleza.",
      format: "vertical",
      poster: "",
      videoSrc: r2Url(R2_PUBLIC_BASE, "8. Por que eu não falo apenas de beleza.mp4"),
      downloadHref: r2Url(R2_PUBLIC_BASE, "8. Por que eu não falo apenas de beleza.mp4"),
      ready: true,
    },
    // --- Linha 3: posições 07-09 ficam "Em breve" (sem vídeo) ---
  ],
};
