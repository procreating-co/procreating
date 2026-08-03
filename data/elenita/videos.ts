import type { ClientVideos } from "@/lib/clients/types";

/**
 * Os 3 vídeos sociais reais ("01. Protocolo Elleve", "02. Você decidiu se priorizar.",
 * "03. Educativo" — todos verticais, por isso aparecem lado a lado numa única linha, ver
 * `components/landing/how-it-works-section.tsx`) ficam direto em `public/videos/` e
 * commitados no git — decisão explícita, fora do padrão do projeto (vídeo normalmente vai pro
 * R2, ver `docs/r2.md`), tomada como atalho até o upload real pro bucket acontecer. Quando
 * migrar pro R2: trocar só `videoSrc`/`downloadHref` pela URL do bucket (`r2Url()`, mesmo padrão
 * de `data/_template/videos.ts`), `ready` continua `true`.
 *
 * `acquisitionVideo`/`presentationVideo` (bloco "Conteúdos de apresentação") removidos de
 * propósito — a Elenita não tem essa seção (pedido explícito), `ClientVideos` os torna opcionais
 * exatamente pra isso, ver `lib/clients/types.ts`.
 */
export const clientVideos: ClientVideos = {
  socialVideos: [
    {
      id: "social-vertical-01",
      number: "01",
      title: "Protocolo Elleve",
      format: "vertical",
      poster: "/images/gallery/elenita-video-protocolo-elleve.jpg",
      videoSrc: "/videos/elenita-social-01-protocolo-elleve.mp4",
      downloadHref: "/videos/elenita-social-01-protocolo-elleve.mp4",
      ready: true,
    },
    {
      id: "social-vertical-02",
      number: "02",
      title: "Você decidiu se priorizar.",
      format: "vertical",
      poster: "/images/gallery/elenita-video-priorizar.jpg",
      videoSrc: "/videos/elenita-social-02-voce-decidiu-se-priorizar.mp4",
      downloadHref: "/videos/elenita-social-02-voce-decidiu-se-priorizar.mp4",
      ready: true,
    },
    {
      id: "social-vertical-03",
      number: "03",
      title: "Educativo",
      format: "vertical",
      poster: "/images/gallery/elenita-video-educativo.jpg",
      videoSrc: "/videos/elenita-social-03-educativo.mp4",
      downloadHref: "/videos/elenita-social-03-educativo.mp4",
      ready: true,
    },
  ],
};
