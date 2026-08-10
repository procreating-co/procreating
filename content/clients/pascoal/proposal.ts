import type { PascoalProposalContent } from "@/lib/pascoal-proposal/types";

/**
 * Proposta de Continuidade — Pascoal Bombas. Página comercial isolada
 * (`/clients/pascoal/public/proposta`, servida via rewrite — ver `next.config.js` — por um app
 * route próprio em `app/pascoal-proposta/page.tsx`), pensada pra apresentação AO VIVO: sem
 * nenhum CTA comercial, o configurador é a própria ferramenta de apresentação, ajustado na hora
 * durante a conversa.
 *
 * PREÇOS AINDA NÃO DEFINIDOS — todo valor comercial abaixo está zerado de propósito. Antes de
 * apresentar, edite apenas os números em `configurator` (nunca espalhe preço em outro lugar):
 *   - `videoOptions[].base` → preço mensal em cada quantidade de vídeo, sem nenhum toggle ligado
 *   - `toggles.traffic.priceDelta` / `toggles.prospecting.priceDelta` → acréscimo de cada serviço
 *   - `minPrice` → piso absoluto do valor mensal
 * Modelo de preço do configurador é puramente aditivo, sem tabela de casos:
 *   total = videoOption.base + (traffic ? toggles.traffic.priceDelta : 0) + (prospecting ? toggles.prospecting.priceDelta : 0)
 * (ver components/proposal-pascoal/proposal-pascoal-configurator.tsx)
 */
export const pascoalProposal: PascoalProposalContent = {
  slug: "pascoal",
  brandName: "Pascoal Bombas",
  accentColor: "#d4af6a",
  metaTitle: "Proposta de Continuidade — Pascoal Bombas",
  metaDescription: "Uma parceria estratégica de marketing.",

  hero: {
    eyebrow: "Parceria estratégica de marketing",
    title: "Construindo o próximo capítulo da Pascoal",
    subtitle: "Estratégia, conteúdo e crescimento trabalhando na mesma direção.",
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
        "Integração entre conteúdo, audiência e comercial",
      ],
    },
    {
      number: "02",
      title: "Posicionamento Digital",
      description: "Como a estratégia vira presença — o vídeo é uma ferramenta dentro do posicionamento, não o produto final.",
      items: [
        "Estratégia de comunicação",
        "Linha editorial",
        "Produção de conteúdo",
        "Escrita de roteiros",
        "Direção criativa",
        "Captação",
        "Edição",
        "Conteúdo estratégico",
        "Construção de autoridade",
        "Presença digital",
      ],
    },
    {
      number: "03",
      title: "Crescimento",
      description: "A aceleração da Pascoal — distribuição, alcance e otimização orientada por dados.",
      items: [
        "Estratégias de alavancagem da marca",
        "Tráfego pago",
        "Crescimento de audiência",
        "Distribuição estratégica",
        "Amplificação de conteúdos",
        "Campanhas de aquisição",
        "Testes de criativos",
        "Otimização",
        "Análise de dados",
      ],
    },
  ],

  configurator: {
    eyebrow: "Ao vivo",
    heading: "Defina o nível da operação",
    subtitle: "Cada componente representa trabalho real — ajuste e veja o investimento acompanhar a escolha.",
    contentLabel: "Conteúdo",
    videoOptions: [
      // Preços ainda não definidos para a Pascoal — ajustar antes da apresentação.
      { id: "4", count: 4, label: "4 vídeos/mês", base: 0 },
      { id: "8", count: 8, label: "8 vídeos/mês", base: 0 },
    ],
    strategyLabel: "Estratégia",
    strategyIncluded: "Estratégias de Marketing + Posicionamento Digital",
    growthLabel: "Crescimento",
    expansionLabel: "Expansão",
    toggles: {
      traffic: { id: "trafego", label: "Tráfego pago", priceDelta: 0, note: "Verba de mídia não inclusa." },
      prospecting: { id: "prospeccao", label: "Estratégia de prospecção ativa", priceDelta: 0 },
    },
    minPrice: 0,
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
      { number: "04", title: "Oportunidades", description: "Conteúdo e audiência passam a trabalhar juntos para gerar novas oportunidades comerciais." },
      { number: "05", title: "Flexibilidade", description: "A operação pode aumentar ou diminuir conforme as necessidades." },
    ],
  },

  closing: {
    heading: "A próxima etapa começa aqui.",
    paragraph: "Uma parceria estratégica contínua — construída, ajustada e revisada junto com a Pascoal a cada etapa.",
  },
};
