import type { ClientVideos } from "@/lib/clients/types";
import { r2Url } from "@/lib/r2";

/**
 * Os 3 vídeos sociais reais já existem ("01. Protocolo Elleve", "02. Você decidiu se
 * priorizar.", "03. Educativo" — todos verticais, por isso aparecem lado a lado numa única
 * linha, ver `components/landing/how-it-works-section.tsx`) mas ainda NÃO foram enviados pro
 * bucket R2 — sem credencial de R2 configurada neste ambiente pra fazer o upload. `ready: false`
 * por enquanto (mostra "Em produção" em vez de tentar tocar um arquivo que não existe);
 * `videoSrc`/`downloadHref` já apontam pro caminho esperado no bucket (convenção
 * `clients/elenita/videos/`, ver `data/README.md`) — assim que o arquivo subir com esse nome,
 * troque só `ready` para `true`, nada mais precisa mudar.
 *
 * `acquisitionVideo`/`presentationVideo` (bloco "Conteúdos de apresentação") seguem sem
 * material real ainda — mesmo placeholder honesto de antes.
 */
const R2_PUBLIC_BASE = "https://<seu-bucket>.r2.dev/clients/elenita/videos";

export const clientVideos: ClientVideos = {
  socialVideos: [
    {
      id: "social-vertical-01",
      number: "01",
      title: "Protocolo Elleve",
      format: "vertical",
      poster: "/images/gallery/elenita-video-protocolo-elleve.jpg",
      videoSrc: r2Url(R2_PUBLIC_BASE, "01. Protocolo Elleve.mp4"),
      downloadHref: r2Url(R2_PUBLIC_BASE, "01. Protocolo Elleve.mp4"),
      ready: false,
    },
    {
      id: "social-vertical-02",
      number: "02",
      title: "Você decidiu se priorizar.",
      format: "vertical",
      poster: "/images/gallery/elenita-video-priorizar.jpg",
      videoSrc: r2Url(R2_PUBLIC_BASE, "02. Você decidiu se priorizar..mp4"),
      downloadHref: r2Url(R2_PUBLIC_BASE, "02. Você decidiu se priorizar..mp4"),
      ready: false,
    },
    {
      id: "social-vertical-03",
      number: "03",
      title: "Educativo",
      format: "vertical",
      poster: "/images/gallery/elenita-video-educativo.jpg",
      videoSrc: r2Url(R2_PUBLIC_BASE, "03. Educativo.mp4"),
      downloadHref: r2Url(R2_PUBLIC_BASE, "03. Educativo.mp4"),
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
