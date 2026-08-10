import type { ProposalContent } from "@/lib/clients/proposal-types";

/**
 * Proposta de Continuidade — Dra. Elenita Luzardo. Página comercial isolada
 * (`/clients/elenita/public/proposta`), pensada pra apresentação AO VIVO.
 *
 * PREÇOS DO ORÇAMENTO — só os itens em `configurator.variableItems` pesam no total (o resto,
 * `fixedItems`, é sempre incluso, sem afetar o valor):
 *   8 vídeos (4000) + Programa de TV (800) + Tráfego pago (500) + Prospecção ativa (900) = 6.200
 *   4 vídeos (3200) + Programa de TV (800) + Tráfego pago (500) + Prospecção ativa (900) = 5.400
 * Pra mudar um valor: edite só o `price` do item correspondente — o total em
 * proposal-configurator.tsx é sempre a soma dos itens variáveis ativos.
 */
export const elenitaProposal: ProposalContent = {
  slug: "elenita",
  brandName: "Dra. Elenita Luzardo",
  accentColor: "#b76e79",
  metaTitle: "Proposta de Continuidade — Dra. Elenita Luzardo",
  metaDescription: "Uma parceria estratégica de marketing.",

  hero: {
    eyebrow: "Parceria estratégica de marketing",
    title: "Uma nova era se inicia agora...",
    subtitle: "Uma estrutura contínua para fortalecer marca, audiência e oportunidades.",
  },

  pillarsIntro: {
    eyebrow: "",
    heading: "O que propomos",
    subtitle: "Uma assessoria estratégica de marketing em diferentes frentes.",
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
        title: "Prospecção ativa",
        description: "Uma estratégia ativa de conexão com empresas com potencial de associação à marca.",
        items: ["Mapeamento de empresas", "Definição de perfis estratégicos", "Identificação de oportunidades", "Listas qualificadas", "Abordagem estruturada"],
      },
      {
        number: "02",
        title: "Patrocínio",
        description: "Aproximação de empresas com interesse em associar sua marca ao projeto.",
        items: ["Identificação de oportunidades", "Estrutura de abordagem", "Apresentação da oportunidade", "Construção de relacionamento"],
      },
      {
        number: "03",
        title: "Parcerias",
        description: "Conexões estratégicas com marcas que ampliam audiência e autoridade.",
        items: ["Colaboração", "Relacionamento", "Audiência", "Autoridade", "Novas oportunidades"],
      },
      {
        number: "04",
        title: "Crescimento",
        description: "Aquisição não termina no primeiro contato — é um ciclo contínuo.",
        items: ["Novas conexões", "Novas oportunidades", "Maior alcance", "Maior autoridade"],
      },
    ],
  },

  configurator: {
    heading: "Orçamento",
    fixedLabel: "Estrutura estratégica",
    fixedItems: [
      { id: "estrategia", label: "Estratégia" },
      { id: "linha-editorial", label: "Linha editorial" },
      { id: "planejamento-estrategico", label: "Planejamento estratégico" },
      { id: "posicionamento", label: "Posicionamento" },
      { id: "direcao-estrategica", label: "Direção estratégica" },
      { id: "roteirizacao", label: "Roteirização" },
      { id: "captacao-mensal", label: "Captação mensal" },
    ],
    variableLabel: "Frentes de expansão",
    variableItems: [
      {
        kind: "video-tier",
        id: "videos",
        defaultOptionId: "8",
        options: [
          { id: "4", count: 4, label: "4 vídeos/mês", price: 3200 },
          { id: "8", count: 8, label: "8 vídeos/mês", price: 4000 },
        ],
      },
      { kind: "toggle", id: "programa-tv", label: '"Cara a Cara com a Beleza"', price: 800, defaultOn: true },
      { kind: "toggle", id: "trafego-pago", label: "Tráfego pago", price: 500, defaultOn: true },
      { kind: "toggle", id: "prospeccao-ativa", label: "Estratégia de prospecção ativa", price: 900, defaultOn: true },
    ],
  },

  closing: {
    heading: "A próxima etapa começa aqui.",
    paragraph: "Uma parceria estratégica contínua até dezembro de 2026 — construída, ajustada e revisada junto com a Elenita a cada etapa.",
  },
};
