import type { ClientConfig } from "@/lib/clients/types";

/**
 * Mesma arquitetura da Pascoal (`data/pascoal/config.ts`) — pipeline legado via
 * `lib/clients/registry.ts`, não mais o template `Presentation` de seções dinâmicas
 * (pivô explícito: a entrega da Elenita passa a ter a mesma estrutura da Pascoal, só
 * trocando copy e vídeos depois). Nenhum campo aqui aponta pra mídia real de outro
 * cliente — tudo que ainda não existe usa um placeholder honesto (`/placeholder.svg`,
 * `ready: false` em `videos.ts`) até o material real da Dra. Elenita ser entregue.
 */
export const clientConfig: ClientConfig = {
  slug: "elenita",
  brandName: "Dra. Elenita Luzardo",
  logo: "/placeholder-logo.svg",

  metadata: {
    title: "Dra. Elenita Luzardo | Posicionamento Digital",
    description: "Projeto de posicionamento digital e autoridade profissional da Dra. Elenita Luzardo.",
  },

  theme: {
    accentColor: "#b76e79",
  },

  nav: {
    galleryLabel: "Acessar Galeria",
    prospeccaoCtaLabel: "Prospectar Parceiros",
  },

  hero: {
    welcomeLines: ["Sejam bem-vindos,", "Dra. Elenita."],
    backgroundVideo: "/videos/elenita-hero-background.mp4",
    paragraph: "Apresentação em desenvolvimento — fotos, vídeos e textos finais chegam nas próximas etapas.",
    stats: {
      videos: { count: 0, label: "vídeos produzidos" },
      photos: { count: 0, label: "fotos editadas" },
    },
  },

  features: {
    eyebrow: "Projeto Inicial",
    heading: "Autoridade e Presença Digital.",
    blockNumber: "01.",
    blockTitle: "Fotos Produzidas",
    subtitle: "Espaço reservado para as fotos profissionais da Dra. Elenita — ativo assim que o material for entregue.",
    galleryButtonLabel: "Acessar Galeria",
    photos: [
      { src: "/placeholder.svg", alt: "Foto em produção — aguardando material real", category: "Retratos" },
      { src: "/placeholder.svg", alt: "Foto em produção — aguardando material real", category: "Consultório" },
    ],
  },

  videosSection: {
    eyebrow: "Vídeos",
    headingPrefix: "Conteúdos",
    headingSuffix: "para redes sociais.",
    blockNumber: "02.",
    blockTitle: "Vídeos Produzidos.",
    subtitle: "Vídeos institucionais e de apresentação, em produção — estreia nas próximas etapas.",
    acquisitionEyebrow: "Estratégia de Conteúdo",
    acquisitionHeadingPrefix: "Conteúdos",
    acquisitionHeadingSuffix: "de apresentação.",
  },

  footer: {
    legalLine: "Desenvolvido para Dra. Elenita Luzardo.\nDados legais a confirmar com a cliente.",
  },

  gallery: {
    accessCodes: ["elenita", "admin"],
    lockScreenTitle: "Galeria de Conteúdos",
  },

  prospeccao: null,
};
