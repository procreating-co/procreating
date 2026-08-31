import type { ClientConfig } from "@/lib/clients/types";

/**
 * Mesma arquitetura da Pascoal (`data/pascoal/config.ts`) — pipeline legado via
 * `lib/clients/registry.ts`. Copy e mídia reais da Dra. Elenita: hero, features e galeria vêm
 * das fotos entregues (`public/gallery/elenita/**`); os 3 vídeos de redes sociais ainda estão
 * pendentes de upload no R2 (ver `videos.ts`) — vídeo de fundo do Hero já está em
 * `public/videos/elenita-hero-background.mp4` (mesma exceção de tamanho que
 * `hero-background.mp4` da Pascoal, ver `.gitignore`).
 *
 * `siteLock` gira a Home inteira atrás de senha, a pedido explícito da cliente — diferente da
 * Pascoal, que mantém a Home aberta e só a Galeria protegida.
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
    extraLink: { label: "Proposta de Continuidade", href: "/propostas/elenita-luzardo" },
  },

  hero: {
    welcomeLines: ["Seja bem-vinda,", "Dra. Elenita."],
    backgroundVideo: "/videos/elenita-hero-background.mp4",
    paragraph: "Todos materiais captados estão aqui...",
    stats: {
      videos: { count: 3, label: "vídeos produzidos" },
      photos: { count: 116, label: "fotos editadas" },
    },
  },

  features: {
    eyebrow: "Projeto Inicial",
    heading: "Posicionamento Digital.",
    blockNumber: "01.",
    blockTitle: "Fotos Produzidas",
    subtitle: "Captamos a essência do consultório, equipe e a experiência das pacientes com a doutora.",
    galleryButtonLabel: "Acessar Galeria",
    photos: [
      { src: "/images/gallery/elenita-retratos.jpg", alt: "Retratos da Dra. Elenita", category: "Retratos Dra. Elenita" },
      { src: "/images/gallery/elenita-consultorio.jpg", alt: "Consultório da Dra. Elenita", category: "Consultório" },
      { src: "/images/gallery/elenita-procedimento.jpg", alt: "Procedimento na Dra. Elenita", category: "Procedimento" },
      { src: "/images/gallery/elenita-retratos-alexandre.jpg", alt: "Retratos da Dra. Elenita e Alexandre", category: "Retratos Dra. Elenita e Alexandre" },
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
  },

  footer: {
    legalLine: "Desenvolvido para Dra. Elenita Luzardo Odontologia Ltda.\nCNPJ 38.140.444/0001-03.",
  },

  gallery: {
    accessCodes: ["elenita", "admin"],
    lockScreenTitle: "Galeria de Conteúdos",
  },

  prospeccao: null,

  siteLock: {
    accessCodes: ["elenita", "admin"],
    lockScreenTitle: "Acesso Exclusivo",
  },
};
