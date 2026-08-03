import type { PresentationContent } from "@/lib/clients/presentation-types";

/**
 * Apresentação da Dra. Elenita Luzardo — a primeira construída sobre o sistema de seções
 * configuráveis. `sections` é uma lista: habilitar/desabilitar, reordenar ou trocar uma seção
 * de tipo é editar só este arquivo, nunca um componente. Cada `content` é honesto sobre não ter
 * material final ainda (todo placeholder de mídia é rotulado, nunca uma foto/vídeo inventado).
 * Mesmo `accentColor` já usado no Workspace (`content/clients/elenita/workspace.ts`).
 */
export const elenitaPresentation: PresentationContent = {
  slug: "elenita",
  brandName: "Dra. Elenita Luzardo",
  accentColor: "#b76e79",
  metaTitle: "Dra. Elenita Luzardo",
  metaDescription: "Posicionamento digital de Dra. Elenita Luzardo.",

  sections: [
    {
      id: "hero",
      type: "hero",
      title: "Posicionamento pessoal",
      enabled: true,
      content: {
        positioning: "Autoridade e presença digital para uma trajetória construída com confiança.",
        note: "Apresentação em desenvolvimento — fotos, vídeos e textos finais chegam nas próximas etapas.",
        mediaLabel: "Vídeo de apresentação — em produção",
        cta: { label: "Conhecer o posicionamento", href: "#sobre" },
      },
    },
    {
      id: "sobre",
      type: "about",
      title: "Sobre",
      enabled: true,
      content: {
        heading: "Uma trajetória que fala por si",
        body: "Espaço reservado para a apresentação pessoal e profissional de Dra. Elenita Luzardo — biografia, formação e o que a diferencia serão definidos com a cliente nas próximas etapas.",
      },
    },
    {
      id: "projeto",
      type: "project",
      title: "Projeto",
      enabled: true,
      content: {
        heading: "Posicionamento sob medida",
        body: "A Procreating está desenvolvendo uma apresentação digital que traduz a autoridade profissional da Dra. Elenita em uma experiência online à altura.",
        pillars: ["Identidade visual própria", "Estrutura de conteúdo dedicada", "Presença digital de autoridade"],
      },
    },
    {
      id: "conteudos",
      type: "content",
      title: "Conteúdos",
      enabled: true,
      content: {
        heading: "Estratégia de conteúdo",
        body: "Os pilares de conteúdo desta apresentação serão definidos junto com a cliente — o espaço já está preparado para recebê-los.",
        tags: ["Autoridade", "Bastidores", "Educação", "Resultados"],
      },
    },
    {
      id: "galeria",
      type: "gallery",
      title: "Galeria",
      enabled: true,
      content: {
        heading: "Fotos preparadas",
        body: "Espaço reservado para a galeria de fotos profissionais — ativa assim que o material for entregue.",
        placeholders: ["Retrato principal", "Ambiente profissional", "Detalhes", "Equipe", "Bastidores", "Resultados"],
      },
    },
    {
      id: "videos",
      type: "videos",
      title: "Vídeos",
      enabled: true,
      content: {
        heading: "Vídeos preparados",
        body: "Espaço reservado para vídeo institucional e de apresentação — ativo assim que o material for entregue.",
        placeholders: ["Vídeo de apresentação", "Vídeo institucional"],
      },
    },
    {
      id: "estrategia",
      type: "strategy",
      title: "Estratégia",
      enabled: true,
      content: {
        heading: "Visão de crescimento",
        body: "O plano estratégico de posicionamento digital será construído em conjunto com a cliente, com foco em autoridade e resultado de longo prazo.",
        steps: [
          { title: "Fundação", description: "Identidade visual e estrutura da apresentação" },
          { title: "Conteúdo", description: "Produção de fotos, vídeos e textos finais" },
          { title: "Crescimento", description: "Expansão de presença e autoridade digital" },
        ],
      },
    },
  ],
};
