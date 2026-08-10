import type { ProposalContent } from "@/lib/clients/proposal-types";

/**
 * Proposta de Continuidade — Dra. Elenita Luzardo. Página comercial isolada
 * (`/clients/elenita/public/proposta`), pensada pra apresentação AO VIVO — por isso não tem
 * nenhum CTA comercial ("falar com a gente", "quero saber mais"): o configurador é a própria
 * ferramenta de apresentação, ajustado na hora durante a conversa.
 *
 * Modelo de preço do configurador — puramente aditivo, sem tabela de casos:
 *   total = videoOption.base + (traffic ? toggles.traffic.priceDelta : 0) + (prospecting ? toggles.prospecting.priceDelta : 0)
 * Confere com as 8 combinações exigidas (4k/4.5k/5.55k/6.05k/5.2k/5.7k/6.75k/7.25k) — validado em
 * components/proposal/proposal-configurator.tsx e no smoke test das 8 combinações.
 */
export const elenitaProposal: ProposalContent = {
  slug: "elenita",
  brandName: "Dra. Elenita Luzardo",
  accentColor: "#b76e79",
  metaTitle: "Proposta de Continuidade — Dra. Elenita Luzardo",
  metaDescription: "Uma parceria estratégica de marketing.",

  hero: {
    eyebrow: "Parceria estratégica de marketing",
    title: "O próximo nível começa pela estratégia",
    subtitle: "Uma estrutura contínua para fortalecer marca, audiência e oportunidades.",
  },

  growthAnimation: {
    eyebrow: "Uma direção só",
    heading: "Cada etapa constrói a próxima.",
    steps: ["Estratégia", "Posicionamento", "Conteúdo", "Audiência", "Autoridade", "Crescimento"],
  },

  pillarsIntro: { eyebrow: "Como a operação funciona", heading: "Uma operação. Diferentes frentes." },

  pillars: [
    {
      number: "01",
      title: "Estratégias de Marketing",
      description: "A camada que orquestra todas as outras — o olhar acima da operação do dia a dia.",
      items: [
        "Direção estratégica da marca",
        "Planejamento mensal",
        "Análise de oportunidades",
        "Estratégia de aquisição",
        "Estratégia de autoridade",
        "Calendário estratégico",
        "Campanhas e ações especiais",
        "Análise de métricas e tomada de decisão",
        "Integração entre conteúdo, audiência e oportunidades comerciais",
      ],
    },
    {
      number: "02",
      title: "Posicionamento Digital",
      description: "Como a estratégia vira presença — o vídeo é uma ferramenta dentro do posicionamento, não o produto final.",
      items: [
        "Estratégia exclusiva de comunicação",
        "Produção de conteúdo",
        "Escrita de roteiros",
        "Direção criativa",
        "Captação mensal — 4 ou 8 vídeos/mês",
        "Desenvolvimento da autoridade digital",
        "Linha editorial",
        "Planejamento de presença digital",
      ],
    },
    {
      number: "03",
      title: "Crescimento",
      description: "A aceleração da marca — distribuição, alcance e otimização orientada por dados.",
      items: [
        "Alavancagem de marca",
        "Tráfego pago",
        "Crescimento de audiência",
        "Distribuição estratégica de conteúdo",
        "Amplificação dos melhores conteúdos",
        "Campanhas de aquisição",
        "Testes de criativos",
        "Otimização baseada em dados",
        "Expansão de alcance",
      ],
    },
  ],

  tvProgram: {
    eyebrow: "Integrado à operação",
    heading: "Programa de TV",
    description: "A reunião da primeira semana do mês organiza o fluxo completo do episódio.",
    steps: ["Reunião mensal", "Pautas", "Roteirização", "Direção", "Produção", "Gravação"],
  },

  configurator: {
    eyebrow: "Ao vivo",
    heading: "Defina o nível da operação",
    subtitle: "Cada componente representa trabalho real — ajuste e veja o investimento acompanhar a escolha.",
    contentLabel: "Conteúdo",
    videoOptions: [
      { id: "4", count: 4, label: "4 vídeos/mês", base: 4000 },
      { id: "8", count: 8, label: "8 vídeos/mês", base: 5200 },
    ],
    strategyLabel: "Estratégia",
    strategyIncluded: "Estratégias de Marketing + Posicionamento Digital",
    growthLabel: "Crescimento",
    expansionLabel: "Expansão",
    toggles: {
      traffic: { id: "trafego", label: "Tráfego pago", priceDelta: 500, note: "Verba de mídia não inclusa." },
      prospecting: { id: "prospeccao", label: "Estratégia de prospecção ativa", priceDelta: 1550 },
    },
    minPrice: 4000,
    recommendedTag: "Configuração recomendada",
    customTag: "Operação personalizada",
  },

  whyContinuity: {
    eyebrow: "Por que continuidade?",
    heading: "Cinco razões para pensar além do próximo vídeo",
    points: [
      { number: "01", title: "Consistência", description: "Autoridade é construída através de presença contínua." },
      { number: "02", title: "Estratégia", description: "Cada conteúdo passa a fazer parte de uma estratégia maior." },
      { number: "03", title: "Evolução", description: "Os resultados de cada período orientam as decisões seguintes." },
      { number: "04", title: "Oportunidades", description: "Conteúdo, programa e audiência passam a trabalhar juntos para gerar novas oportunidades." },
      { number: "05", title: "Flexibilidade", description: "A operação pode aumentar ou diminuir conforme as necessidades." },
    ],
  },

  closing: {
    heading: "A próxima etapa começa aqui.",
    paragraph: "Uma parceria estratégica contínua até dezembro de 2026 — construída, ajustada e revisada junto com a Elenita a cada etapa.",
  },
};
