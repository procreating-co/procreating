import type { ClientConfig } from "@/lib/clients/types";
import { r2Url } from "@/lib/r2";
import { galleryPhotos } from "./gallery";

/** URL pública do bucket `drasandra` no R2 (mesma de `data/drasandragomboski/videos.ts`). */
const R2_PUBLIC_BASE = "https://pub-efdfecafe11a4cb4aacac47948335da3.r2.dev";

/**
 * Dra. Sandra Gomboski — duplicata da arquitetura da Dra. Elenita (`data/elenita/config.ts`),
 * pipeline legado "posicionamento-pro" via `lib/clients/registry.ts`.
 *
 * Montado em modo "slots" (pedido explícito): as fotos do carrossel e os vídeos ainda não foram
 * entregues, então entram como placeholders pra preencher depois —
 *   - carrossel da Home: `features.photos` com `src: null` → cards "Em breve".
 *   - vídeos: `videosSection.production` ativa o contador animado "12 vídeos em produção" + 12
 *     slots, no lugar dos vídeos sociais prontos (`videos.ts` fica com `socialVideos: []`).
 *   - galeria: pastas criadas em `public/gallery/drasandragomboski/<id>/` (vazias por enquanto).
 *   - Hero: sem vídeo de fundo ainda (`backgroundVideo: ""`) e sem os números (`stats` omitido).
 */
export const clientConfig: ClientConfig = {
  slug: "drasandragomboski",
  brandName: "Dra. Sandra Gomboski",
  logo: "/placeholder-logo.svg",

  metadata: {
    title: "Dra. Sandra Gomboski | Posicionamento Digital",
    description: "Projeto de posicionamento digital e autoridade profissional da Dra. Sandra Gomboski.",
  },

  theme: {
    accentColor: "#b76e79",
  },

  nav: {
    galleryLabel: "Acessar Galeria",
    prospeccaoCtaLabel: "Prospectar Parceiros",
    // "Proposta de Continuidade" removida a pedido — sem `extraLink`, o menu fica sem o item extra.
  },

  hero: {
    welcomeLines: ["Seja bem-vinda,", "Dra. Sandra."],
    // Vídeo de fundo do Hero (hero01.mp4 no bucket R2).
    backgroundVideo: r2Url(R2_PUBLIC_BASE, "hero01.mp4"),
    paragraph: "Todos materiais captados estão aqui...",
    stats: {
      videos: { count: 14, label: "vídeos produzidos" },
      photos: { count: 59, label: "fotos editadas" },
    },
  },

  features: {
    eyebrow: "Projeto Inicial",
    heading: "Posicionamento Digital.",
    blockNumber: "01.",
    blockTitle: "Fotos Produzidas",
    subtitle: "Captamos a essência do instituto, equipe e a experiência das pacientes com a doutora.",
    galleryButtonLabel: "Acessar Galeria",
    // Carrossel-teaser da Home: as mesmas 6 fotos da galeria (R2), `category: ""` para não
    // mostrar rótulo por cima. Fonte única em `gallery.ts` (`galleryPhotos`).
    photos: galleryPhotos.map((photo) => ({ ...photo, category: "" })),
  },

  videosSection: {
    eyebrow: "Vídeos",
    headingPrefix: "Conteúdos",
    headingSuffix: "para redes sociais.",
    blockNumber: "02.",
    blockTitle: "Vídeos Produzidos.",
    subtitle: "Conteúdos estratégicos para o perfil nas redes sociais.",
    acquisitionEyebrow: "Estratégia de Conteúdo",
    acquisitionHeadingPrefix: "Conteúdos",
    acquisitionHeadingSuffix: "de apresentação.",
    // Mantém os 12 espaços (grade), sem o contador "em produção" (`label` omitido) — estilo Elenita.
    // Os vídeos entregues preenchem suas posições (por `number`); o resto fica "Em breve".
    production: { count: 12 },
    // Bloco "Anúncios de Remarketing" com 2 espaços; o 1º preenchido por `videos.adsVideos`
    // ("Remarketing 1"), o 2º fica "Em breve".
    ads: {
      blockNumber: "03.",
      blockTitle: "Anúncios de Remarketing.",
      production: { count: 2, columns: 2 },
    },
  },

  footer: {
    legalLine: "INSTITUTO SANDRA GOMBOSKI HARMONIZACAO E SAUDE LTDA\nCNPJ 65.940.333/0001-46.",
  },

  gallery: {
    accessCodes: ["sandra", "admin"],
    lockScreenTitle: "Galeria de Conteúdos",
    // Botão de baixar em cada foto da grade (além do botão no lightbox).
    allowDownload: true,
  },

  prospeccao: null,

  siteLock: {
    accessCodes: ["sandra", "admin"],
    lockScreenTitle: "Acesso Exclusivo",
  },
};
