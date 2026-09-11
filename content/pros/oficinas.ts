import { r2Url } from "@/lib/r2";
import { clientVideos as pascoalLegacyVideos } from "@/data/pascoal/videos";

/**
 * Conteúdo da página de prospecção `/pros/01` — nicho "oficinas, mecânicas e negócios técnicos",
 * usando a Pascoal Bombas como case. Redesenho pedido explícito: só 4 blocos (Hero / VSL / Galeria
 * de vídeos / CTA final) — tudo que não é um desses 4 foi removido de propósito, não é "esquecido".
 *
 * Toda mídia é real — vídeos hospedados nos MESMOS buckets R2 já em produção
 * (`data/pascoal/videos.ts`, legado; `data/pascoal/setembro-videos.ts`, os 12 novos).
 */

const SETEMBRO_R2_BASE = "https://pub-42560a6ade7e4e5994d209ebe8c409c9.r2.dev";

export type ProsGalleryVideo = {
  src: string;
  orientation: "vertical" | "horizontal";
  /** Colunas ocupadas num grid de 6 no desktop — controlado à mão (curadoria editorial), não
   *  calculado — pedido explícito: verticais precisam ter presença, não parecer miniatura ao
   *  lado dos horizontais. */
  span: number;
};

const setembro = (filename: string, orientation: ProsGalleryVideo["orientation"], span: number): ProsGalleryVideo => ({
  src: r2Url(SETEMBRO_R2_BASE, filename),
  orientation,
  span,
});

const legacy = (src: string, orientation: ProsGalleryVideo["orientation"], span: number): ProsGalleryVideo => ({ src, orientation, span });

export const oficinasProsContent = {
  slug: "01",
  metaTitle: "Procreating — presença digital para oficinas e negócios técnicos",
  metaDescription: "A Procreating transformou a Pascoal Bombas em referência digital do próprio mercado.",

  // O número abaixo veio assim do pedido do usuário — é IDÊNTICO ao placeholder que eu mesmo
  // inventei na rodada anterior (mesmos dígitos, mesma mensagem), o que sugere que ainda não é o
  // WhatsApp real da Procreating. Mantido exatamente como pedido; ver aviso no relatório final.
  whatsapp: {
    phoneDigits: "5500000000000",
    message: "Olá! Vi a apresentação da Procreating e quero conversar sobre o meu negócio.",
  },
  instagramUrl: "https://instagram.com/procreating.co",

  hero: {
    videoSrc: "/videos/hero-background.mp4",
    headline: "Seu negócio merece ser memorável.",
  },

  vsl: {
    /** Ausente até a Procreating enviar o arquivo real — ver `pros-vsl.tsx`. */
    videoSrc: undefined as string | undefined,
    label: "Vídeo em produção",
  },

  videoGallery: {
    label: "Pascoal Bombas",
    items: [
      legacy(pascoalLegacyVideos.socialVideos[2].videoSrc, "horizontal", 4), // Entrevista com Pascoal
      setembro("V1Conselho do pascoal - Zona Sul.mp4", "vertical", 2),
      setembro("H6 vídeo situação mais engraçada que aconteceu na Pascoal-_1.mp4", "horizontal", 3),
      legacy(pascoalLegacyVideos.acquisitionVideo!.videoSrc, "vertical", 3),
      legacy(pascoalLegacyVideos.presentationVideo!.videoSrc, "horizontal", 4),
      setembro("V2Erro de diagnóstico - Zona Sul.mp4", "vertical", 2),
      setembro("H9 Frases do Pascoal 1 - Zona Sul.mp4", "horizontal", 6),
    ] satisfies ProsGalleryVideo[],
  },

  finalCta: {
    headline: "Seu negócio já tem valor.\nVamos fazer o mercado perceber.",
    ctaLabel: "Quero conversar",
  },
};

export type ProsContent = typeof oficinasProsContent;
