import { r2Url } from "@/lib/r2";
import { clientVideos as pascoalLegacyVideos } from "@/data/pascoal/videos";

/**
 * Conteúdo da página de prospecção `/pros/01` — nicho "oficinas, mecânicas e negócios técnicos".
 * A página é majoritariamente vídeo (pedido explícito de rodada anterior: zero copy fora do
 * Hero, zero bloco vazio/preto sem vídeo dentro). O Hero é a única exceção — pedido explícito
 * desta rodada: volta a ter um headline (com efeito de digitação numa das linhas) + subheadline.
 *
 * `metaTitle`/`metaDescription`/`ogImage` continuam existindo — são metadata de `<head>`
 * (título da aba, preview ao compartilhar o link), nunca aparecem NA página em si.
 *
 * Toda mídia é real — vídeos hospedados nos MESMOS buckets R2 já em produção
 * (`data/pascoal/videos.ts`, legado; `data/pascoal/setembro-videos.ts`, os 12 novos).
 */

const SETEMBRO_R2_BASE = "https://pub-42560a6ade7e4e5994d209ebe8c409c9.r2.dev";

export type ProsGalleryVideo = {
  src: string;
  orientation: "vertical" | "horizontal";
  /** Colunas ocupadas num grid de 6 no desktop — curadoria manual (verticais precisam ter
   *  presença, não parecer miniatura ao lado dos horizontais). */
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
  metaTitle: "Procreating | Pascoal Bombas",
  metaDescription: "Vídeos produzidos pela Procreating para a Pascoal Bombas.",
  ogImage: "/images/pascoal-equipe-oficina.jpg",

  // O número abaixo veio assim do pedido do usuário — é IDÊNTICO ao placeholder que eu mesmo
  // inventei numa rodada anterior (mesmos dígitos, mesma mensagem), o que sugere que ainda não é
  // o WhatsApp real da Procreating. Mantido exatamente como pedido; ver aviso no relatório final.
  whatsapp: {
    phoneDigits: "5500000000000",
    message: "Olá, gostaria de conversar sobre o posicionamento e a comunicação digital da minha empresa.",
  },

  // Bloco 1 — vídeo de fundo + headline/subheadline. Sem botão de assistir (pedido explícito:
  // "o único vídeo que não pode ser assistido é o vídeo do hero" — segue valendo).
  hero: {
    videoSrc: "/videos/hero-background.mp4",
    headlineLine1: "Seu negócio merece",
    // Linha 2 — digitada/apagada em loop (ver `hooks/use-typewriter.ts`), uma frase por vez.
    rotatingWords: ["ser visto", "ser referência", "ser notado", "ser lembrado", "ser reconhecido"],
    subheadline: "Transformamos sua experiência e resultados em presença digital.",
  },

  // Bloco 2 — scroll/drag reveal (clip-path + pin, framer-motion). Clicável em tela cheia.
  vsl: {
    videoSrc: pascoalLegacyVideos.presentationVideo!.videoSrc,
  },

  // Bloco 3 — grade de vídeos reais da Pascoal Bombas. Clicáveis em tela cheia.
  gallery: [
    legacy(pascoalLegacyVideos.socialVideos[2].videoSrc, "horizontal", 4), // Entrevista com Pascoal
    setembro("V1Conselho do pascoal - Zona Sul.mp4", "vertical", 2),
    setembro("H6 vídeo situação mais engraçada que aconteceu na Pascoal-_1.mp4", "horizontal", 3),
    legacy(pascoalLegacyVideos.acquisitionVideo!.videoSrc, "vertical", 3),
    setembro("H9 Frases do Pascoal 1 - Zona Sul.mp4", "horizontal", 4),
    setembro("V2Erro de diagnóstico - Zona Sul.mp4", "vertical", 2),
  ] satisfies ProsGalleryVideo[],
};

export type ProsContent = typeof oficinasProsContent;
