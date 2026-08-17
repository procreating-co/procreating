import type { ProposalContent } from "@/lib/clients/proposal-types";

/**
 * Proposta de Continuidade — Dra. Elenita Luzardo. Página comercial isolada
 * (`/clients/elenita/public/proposta`), pensada pra apresentação AO VIVO.
 *
 * PREÇOS — `budget.heroNumber` (R$4.000) é o preço único da proposta — a seção de upsell com
 * total variável (R$6.000, camadas opcionais) foi removida a pedido do cliente; hoje só existe
 * esse valor único, já com 4 vídeos editados/mês, tráfego pago e prospecção ativa inclusos
 * (ver `budget.includedItems`).
 */
export const elenitaProposal: ProposalContent = {
  slug: "elenita",
  brandName: "Dra. Elenita Luzardo",
  accentColor: "#b76e79",
  metaTitle: "Proposta de Continuidade — Dra. Elenita Luzardo",
  metaDescription: "Uma parceria estratégica de marketing.",

  hero: {
    eyebrow: "PROPOSTA DE PARCERIA ESTRATÉGIA",
    /** `\n` = quebra de linha proposital (ver proposal-typing-headline.tsx) — não fica por conta do wrap automático. */
    title: "Os próximos capítulos\ncomeçam aqui...",
    subtitle: "Queremos juntos transformar estratégia em resultados.",
  },

  pillarsIntro: {
    eyebrow: "",
    heading: "Mapa do Projeto.",
    subtitle: "Um plano completo para tornar a Dra. Elenita referência em Harmonização para o público de alto padrão em Porto Alegre.",
  },

  pillars: [
    {
      number: "01",
      title: "Estratégia",
      description: "A camada que orquestra todas as outras.",
      items: ["Direção estratégica da marca", "Planejamento mensal", "Análise de oportunidades", "Integração entre frentes"],
    },
    {
      number: "02",
      title: "Posicionamento",
      description: "Como a estratégia vira presença.",
      items: ["Produção de conteúdo", "Roteiros e direção criativa", "Captação mensal", "Autoridade digital"],
    },
    {
      number: "03",
      title: "Crescimento",
      description: "A aceleração da marca.",
      items: ["Tráfego pago", "Distribuição estratégica", "Otimização baseada em dados", "Expansão de alcance"],
    },
  ],

  roadmap: {
    heading: "AGOSTO - DEZEMBRO",
    subtitle: "Diferentes frentes, um único caminho.",
    stages: [
      {
        number: "01",
        title: "Posicionamento de Autoridade",
        items: [
          "Elaboração de linha editorial — formatos, quadros e funis de conteúdo",
          "Organização de perfil como vitrine profissional",
          "Estratégia de monetização",
        ],
      },
      {
        number: "02",
        title: "Alcance",
        items: ["Tráfego estratégico voltado a seguidores qualificados — o foco não é volume, é a audiência certa"],
      },
      {
        number: "03",
        title: "Atração e Crescimento",
        items: ["Funil de atração de pacientes — prova social e conversão"],
      },
      {
        number: "04",
        title: "Programa: Cara a Cara com a Beleza",
        items: ["Procreating como produtora do conteúdo — curadoria de entrevistados, formatos e direção criativa"],
      },
    ],
  },

  tvProgram: {
    eyebrow: "Integrado à operação",
    heading: '"Cara a Cara com a Beleza"',
    subtitle: "Estratégia, planejamento e produção para transformar o programa em um ativo de autoridade, audiência e crescimento.",
    steps: ["Reunião mensal", "Pautas", "Roteirização", "Direção", "Produção", "Acompanhamento"],
  },

  acquisition: {
    eyebrow: "Além do conteúdo",
    heading: "Estratégia de aquisição",
    cards: [
      {
        number: "01",
        title: "Patrocínios",
        description: "Aproximação de empresas com interesse em associar sua marca ao projeto.",
        items: ["Identificação de oportunidades", "Estrutura de abordagem", "Apresentação da oportunidade", "Construção de relacionamento"],
      },
      {
        number: "02",
        title: "Parcerias",
        description: "Conexões estratégicas com marcas que ampliam audiência e autoridade.",
        items: ["Colaboração", "Relacionamento", "Audiência", "Autoridade", "Novas oportunidades", "Parceria com a Unisat"],
      },
      {
        number: "03",
        title: "Crescimento",
        description: "Aquisição não termina no primeiro contato — é um ciclo contínuo.",
        items: ["Novas conexões", "Novas oportunidades", "Maior alcance", "Maior autoridade"],
      },
    ],
  },

  budget: {
    heroNumber: 4000,
    heroLabel: "Base Estratégica",
    heroCaption: "A inteligência por trás do projeto.",
    pillars: [
      { title: "Estratégia", items: ["Posicionamento", "Planejamento", "Direção"] },
      { title: "Conteúdo", items: ["Pilares", "Roteiros", "Direcionamento"] },
      { title: "Gestão", items: ["Acompanhamento", "Análise", "Otimização"] },
      { title: "Produção", items: ["1 captação · 10 vídeos brutos", "4 vídeos editados/mês"] },
    ],
    includedLabel: "Incluso",
    includedItems: [
      "Estratégia completa",
      "Posicionamento",
      "Planejamento",
      "Direção de conteúdo",
      "Acompanhamento estratégico",
      "Captação audiovisual",
      "4 vídeos editados/mês",
      "Tráfego pago (atração de seguidores)",
      "Prospecção ativa",
    ],
    additionalLabel: "Adicionais",
    additionalItems: ["Social media dedicada", "Designs"],
    flowSteps: ["Estratégia", "Planejamento", "Direção", "Execução"],
  },

  closing: {
    heading: "A próxima etapa começa aqui.",
    paragraph: "Uma parceria estratégica contínua até dezembro de 2026 — construída, ajustada e revisada junto com a Elenita a cada etapa.",
  },
};
