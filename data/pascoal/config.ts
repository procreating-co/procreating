import type { ClientConfig } from "@/lib/clients/types";

export const clientConfig: ClientConfig = {
  slug: "pascoal",
  brandName: "Pascoal Bombas",
  logo: "/images/pascoal-logo.png",

  metadata: {
    title: "Pascoal Bombas | Posicionamento e Aquisição",
    description: "Projeto de posicionamento, conteúdo e estratégia de aquisição da Pascoal Bombas.",
    ogImage: "/images/pascoal-equipe-oficina.jpg",
  },

  theme: {
    accentColor: "#d4af6a",
  },

  nav: {
    galleryLabel: "Acessar Galeria",
    prospeccaoCtaLabel: "Prospectar Parceiros",
    extraLink: { label: "Proposta de Continuidade", href: "/clients/pascoal/public/proposta" },
  },

  hero: {
    welcomeLines: ["Sejam bem-vindos,", "Pascoal e equipe."],
    backgroundVideo: "/videos/hero-background.mp4",
    paragraph: "Todos materiais captados estão aqui...",
    stats: {
      videos: { count: 5, label: "vídeos produzidos" },
      photos: { count: 116, label: "fotos editadas" },
    },
  },

  features: {
    eyebrow: "Projeto Inicial",
    heading: "Posicionamento e Aquisição.",
    blockNumber: "01.",
    blockTitle: "Fotos Produzidas",
    subtitle: "Captamos a essência da equipe, dos ambientes e processos das Oficinas Pascoal.",
    galleryButtonLabel: "Acessar Galeria",
    photos: [
      { src: "/images/gallery/retratos-pascoal.jpg", alt: "Retratos da Pascoal Bombas", category: "Retratos Pascoal" },
      { src: "/images/gallery/individuais.jpg", alt: "Retratos individuais da equipe", category: "Individuais" },
      { src: "/images/gallery/equipe.jpg", alt: "Equipe da Pascoal Bombas", category: "Equipe" },
      { src: "/images/gallery/pascoal-zona-sul.jpg", alt: "Unidade Pascoal Zona Sul", category: "Pascoal Zona Sul" },
      { src: "/images/gallery/zona-norte.jpg", alt: "Unidade Pascoal Zona Norte", category: "Pascoal Zona Norte" },
    ],
  },

  videosSection: {
    eyebrow: "Vídeos",
    headingPrefix: "Conteúdos",
    headingSuffix: "para redes sociais.",
    blockNumber: "02.",
    blockTitle: "Vídeos Produzidos.",
    subtitle: "Conteúdos estratégicos para ambos os perfis, programados para estreia a partir dessa sexta-feira.",
    acquisitionEyebrow: "Estratégia de Aquisição",
    acquisitionHeadingPrefix: "Conteúdos",
    acquisitionHeadingSuffix: "para aquisição.",
  },

  footer: {
    legalLine: "Desenvolvido para Pascoal Zona Sul Comércio de Auto Peças Ltda.\nCNPJ 90.041.187/0001-64.",
  },

  gallery: {
    accessCodes: ["pascoal", "admin"],
    lockScreenTitle: "Galeria de Conteúdos",
    driveUrl: "https://drive.google.com/drive/folders/1hTbUV_w31ZOZzDRf7hERf2UL_6BrQWyZ?usp=sharing",
  },

  prospeccao: {
    accessCode: "admin",
    unlockAt: "2026-07-30T00:00:00-03:00",
    eyebrow: "Estratégia de Aquisição",
    headingPrefix: "Prospecção de",
    typingWords: ["Oficinas", "Parceiros", "Negócios"],
    funnelSteps: ["Lista de Prospecção", "Script de Prospecção", "Reunião Estratégica"],
    title: "Central de Prospecção",
    ctaLabel: "Acessar Central de Prospecção.",
    toastText: "Falta pouco!",
  },
};
