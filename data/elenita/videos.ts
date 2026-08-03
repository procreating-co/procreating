import type { ClientVideos } from "@/lib/clients/types";

/**
 * Nenhum vídeo real foi produzido ainda para a Dra. Elenita — os 5 slots ficam `ready: false`
 * (mostra "Em produção" em vez de tentar tocar um arquivo que não existe) até o material real
 * ser entregue e subido no R2 em `clients/elenita/videos/` (mesmo padrão de
 * `data/_template/videos.ts`; ver `data/README.md`).
 */
export const clientVideos: ClientVideos = {
  socialVideos: [
    {
      id: "social-vertical-01",
      number: "01",
      title: "Vídeo institucional — em produção.",
      shortTitle: "Institucional",
      format: "vertical",
      poster: "/placeholder.svg",
      videoSrc: "",
      downloadHref: "",
      ready: false,
    },
    {
      id: "social-vertical-02",
      number: "02",
      title: "Bastidores — em produção.",
      shortTitle: "Bastidores",
      format: "vertical",
      poster: "/placeholder.svg",
      videoSrc: "",
      downloadHref: "",
      ready: false,
    },
    {
      id: "social-horizontal-01",
      number: "03",
      title: "Entrevista — em produção.",
      format: "horizontal",
      poster: "/placeholder.svg",
      videoSrc: "",
      downloadHref: "",
      ready: false,
    },
  ],
  acquisitionVideo: {
    id: "acquisition-01",
    number: "01",
    title: "Vídeo de apresentação — em produção.",
    format: "vertical",
    poster: "/placeholder.svg",
    videoSrc: "",
    downloadHref: "",
    ready: false,
  },
  presentationVideo: {
    id: "presentation-02",
    number: "02",
    title: "Vídeo institucional — em produção.",
    format: "horizontal",
    poster: "/placeholder.svg",
    videoSrc: "",
    downloadHref: "",
    ready: false,
  },
};
