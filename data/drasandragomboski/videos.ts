import type { ClientVideos } from "@/lib/clients/types";
import { r2Url } from "@/lib/r2";

/**
 * Projeto de 12 vídeos da Dra. Sandra (`config.videosSection.production.count = 12`): a grade
 * mostra 12 espaços; os vídeos listados aqui preenchem as primeiras posições (clicáveis, abrem no
 * lightbox) e o restante fica como "Em produção" até serem entregues. Hoje: 8 entregues (01-08),
 * posições 09-12 ainda "Em breve".
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
      id: "sandra-01-quem-sou-eu",
      number: "01",
      title: "Quem sou eu.",
      format: "vertical",
      poster: "",
      videoSrc: r2Url(R2_PUBLIC_BASE, "1. Quem sou eu.mp4"),
      downloadHref: r2Url(R2_PUBLIC_BASE, "1. Quem sou eu.mp4"),
      ready: true,
    },
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
      id: "sandra-03-depoimento-audio",
      number: "03",
      title: "Depoimento via áudio.",
      format: "vertical",
      poster: "",
      videoSrc: r2Url(R2_PUBLIC_BASE, "3. Depoimento via áudio.mp4"),
      downloadHref: r2Url(R2_PUBLIC_BASE, "3. Depoimento via áudio.mp4"),
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
    {
      id: "sandra-05-saude",
      number: "05",
      title: "O que você precisa saber sobre sua saúde antes de falar em procedimentos.",
      format: "vertical",
      poster: "",
      videoSrc: r2Url(R2_PUBLIC_BASE, "5. O que você precisa saber sobre sua saúde antes de falar em procedimentos.mp4"),
      downloadHref: r2Url(R2_PUBLIC_BASE, "5. O que você precisa saber sobre sua saúde antes de falar em procedimentos.mp4"),
      ready: true,
    },
    {
      id: "sandra-06-trajetoria-estudo",
      number: "06",
      title: "Por trás do atendimento, uma trajetória de estudo.",
      format: "vertical",
      poster: "",
      // ⚠️ nome do arquivo no bucket está com "tragetória" (grafia original do upload) — manter exato.
      videoSrc: r2Url(R2_PUBLIC_BASE, "6. Por trás do atendimento uma tragetória de estudo.mp4"),
      downloadHref: r2Url(R2_PUBLIC_BASE, "6. Por trás do atendimento uma tragetória de estudo.mp4"),
      ready: true,
    },
    {
      id: "sandra-07-medo",
      number: "07",
      title: "Eu também tenho medo.",
      format: "vertical",
      poster: "",
      videoSrc: r2Url(R2_PUBLIC_BASE, "7. Eu também tenho medo.mp4"),
      downloadHref: r2Url(R2_PUBLIC_BASE, "7. Eu também tenho medo.mp4"),
      ready: true,
    },
    {
      id: "sandra-08-beleza",
      number: "08",
      title: "Por que eu não falo apenas de beleza.",
      format: "vertical",
      poster: "",
      videoSrc: r2Url(R2_PUBLIC_BASE, "8. Por que eu não falo apenas de beleza.mp4"),
      downloadHref: r2Url(R2_PUBLIC_BASE, "8. Por que eu não falo apenas de beleza.mp4"),
      ready: true,
    },
    {
      id: "sandra-10-nome",
      number: "10",
      title: "Você não precisa saber o nome.",
      format: "vertical",
      poster: "",
      videoSrc: r2Url(R2_PUBLIC_BASE, "10. você não precisa saber o nome.mp4"),
      downloadHref: r2Url(R2_PUBLIC_BASE, "10. você não precisa saber o nome.mp4"),
      ready: true,
    },
    // Posições 09, 11 e 12 ficam "Em breve" até os próximos vídeos chegarem.
  ],
};
