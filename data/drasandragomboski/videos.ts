import type { ClientVideos } from "@/lib/clients/types";
import { r2Url } from "@/lib/r2";

/**
 * Projeto de 12 vídeos da Dra. Sandra (`config.videosSection.production.count = 12`): a grade
 * mostra 12 espaços; os vídeos listados aqui preenchem as primeiras posições (clicáveis, abrem no
 * lightbox) e o restante fica como "Em produção" até serem entregues.
 *
 * ⚠️ `R2_PUBLIC_BASE` precisa ser a URL PÚBLICA do bucket `drasandra` no Cloudflare R2 — NÃO o
 * link do painel (`dash.cloudflare.com/...`). Pegue em: R2 → bucket `drasandra` → Settings →
 * "Public Development URL" (ative se preciso) → algo como `https://pub-xxxxxxxx.r2.dev`. Se os
 * arquivos estiverem dentro de uma pasta no bucket, inclua o prefixo na base.
 */
const R2_PUBLIC_BASE = "https://pub-efdfecafe11a4cb4aacac47948335da3.r2.dev";

export const clientVideos: ClientVideos = {
  socialVideos: [
    {
      id: "sandra-02-cuidar-aparencia",
      number: "02",
      title: "Você tem vontade de cuidar da aparência.",
      format: "vertical",
      poster: "",
      videoSrc: r2Url(R2_PUBLIC_BASE, "2. Você tem vontade de cuidar da aparência.mp4"),
      downloadHref: r2Url(R2_PUBLIC_BASE, "2. Você tem vontade de cuidar da aparência.mp4"),
      ready: true,
    },
    {
      id: "sandra-04-poa",
      number: "04",
      title: "Você já passou por aqui em POA.",
      format: "vertical",
      poster: "",
      videoSrc: r2Url(R2_PUBLIC_BASE, "4. Você já passou por aqui em POA.mp4"),
      downloadHref: r2Url(R2_PUBLIC_BASE, "4. Você já passou por aqui em POA.mp4"),
      ready: true,
    },
  ],
};
