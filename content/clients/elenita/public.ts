import type { PresentationContent } from "@/lib/clients/presentation-types";

/**
 * Primeira apresentação premium construída sobre o template Presentation — honesta sobre não
 * ter fotos/vídeos/textos finais ainda (todo espaço de mídia é um placeholder rotulado, nunca
 * uma imagem/vídeo inventado), mas com identidade e estrutura completas. Mesmo `accentColor` já
 * usado no Workspace (`content/clients/elenita/workspace.ts`).
 */
export const elenitaPresentation: PresentationContent = {
  slug: "elenita",
  brandName: "Dra. Elenita Luzardo",
  accentColor: "#b76e79",
  metaTitle: "Dra. Elenita Luzardo",
  metaDescription: "Posicionamento digital de Dra. Elenita Luzardo.",

  hero: {
    eyebrow: "Posicionamento pessoal",
    positioning: "Autoridade e presença digital para uma trajetória construída com confiança.",
    note: "Apresentação em desenvolvimento — fotos, vídeos e textos finais chegam nas próximas etapas.",
    mediaLabel: "Vídeo de apresentação — em produção",
    cta: { label: "Conhecer o posicionamento", href: "#sobre" },
  },

  sobre: {
    eyebrow: "Sobre",
    heading: "Uma trajetória que fala por si",
    body: "Espaço reservado para a apresentação pessoal e profissional de Dra. Elenita Luzardo — biografia, formação e o que a diferencia serão definidos com a cliente nas próximas etapas.",
  },

  projeto: {
    eyebrow: "Projeto",
    heading: "Posicionamento sob medida",
    body: "A Procreating está desenvolvendo uma apresentação digital que traduz a autoridade profissional da Dra. Elenita em uma experiência online à altura.",
    pillars: ["Identidade visual própria", "Estrutura de conteúdo dedicada", "Presença digital de autoridade"],
  },

  conteudos: {
    eyebrow: "Conteúdos",
    heading: "Estratégia de conteúdo",
    body: "Os pilares de conteúdo desta apresentação serão definidos junto com a cliente — o espaço já está preparado para recebê-los.",
    tags: ["Autoridade", "Bastidores", "Educação", "Resultados"],
  },

  galeria: {
    eyebrow: "Galeria",
    heading: "Fotos preparadas",
    body: "Espaço reservado para a galeria de fotos profissionais — ativa assim que o material for entregue.",
    placeholders: ["Retrato principal", "Ambiente profissional", "Detalhes", "Equipe", "Bastidores", "Resultados"],
  },

  videos: {
    eyebrow: "Vídeos",
    heading: "Vídeos preparados",
    body: "Espaço reservado para vídeo institucional e de apresentação — ativo assim que o material for entregue.",
    placeholders: ["Vídeo de apresentação", "Vídeo institucional"],
  },

  estrategia: {
    eyebrow: "Estratégia",
    heading: "Visão de crescimento",
    body: "O plano estratégico de posicionamento digital será construído em conjunto com a cliente, com foco em autoridade e resultado de longo prazo.",
    steps: [
      { title: "Fundação", description: "Identidade visual e estrutura da apresentação" },
      { title: "Conteúdo", description: "Produção de fotos, vídeos e textos finais" },
      { title: "Crescimento", description: "Expansão de presença e autoridade digital" },
    ],
  },
};
