import type { ClientConfig } from "@/lib/clients/types";

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
    // Sem vídeo de fundo por enquanto (pedido explícito) — o Hero fica com fundo preto.
    backgroundVideo: "",
    paragraph: "Todos materiais captados estão aqui...",
    stats: {
      videos: { count: 12, label: "vídeos produzidos" },
      photos: { count: 30, label: "fotos editadas" },
    },
  },

  features: {
    eyebrow: "Projeto Inicial",
    heading: "Posicionamento Digital.",
    blockNumber: "01.",
    blockTitle: "Fotos Produzidas",
    subtitle: "Captamos a essência do instituto, equipe e a experiência das pacientes com a doutora.",
    galleryButtonLabel: "Acessar Galeria",
    // Slots do carrossel — `src: null` renderiza "Em breve". Troque por caminhos reais
    // (ex.: "/images/gallery/drasandragomboski-retratos.jpg") conforme as fotos chegarem.
    photos: [
      { src: null, alt: "Foto 01 — Dra. Sandra Gomboski", category: "Foto 01" },
      { src: null, alt: "Foto 02 — Dra. Sandra Gomboski", category: "Foto 02" },
      { src: null, alt: "Foto 03 — Dra. Sandra Gomboski", category: "Foto 03" },
      { src: null, alt: "Foto 04 — Dra. Sandra Gomboski", category: "Foto 04" },
      { src: null, alt: "Foto 05 — Dra. Sandra Gomboski", category: "Foto 05" },
      { src: null, alt: "Foto 06 — Dra. Sandra Gomboski", category: "Foto 06" },
    ],
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
  },

  footer: {
    legalLine: "INSTITUTO SANDRA GOMBOSKI HARMONIZACAO E SAUDE LTDA\nCNPJ 65.940.333/0001-46.",
  },

  gallery: {
    accessCodes: ["sandra", "admin"],
    lockScreenTitle: "Galeria de Conteúdos",
  },

  prospeccao: null,

  siteLock: {
    accessCodes: ["sandra", "admin"],
    lockScreenTitle: "Acesso Exclusivo",
  },
};
