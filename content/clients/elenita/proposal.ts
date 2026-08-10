import type { ProposalContent } from "@/lib/clients/proposal-types";

/**
 * Proposta de Continuidade — Dra. Elenita Luzardo. Página comercial isolada
 * (`/clients/elenita/public/proposta`), pensada pra apresentação AO VIVO.
 *
 * PREÇOS DO ORÇAMENTO — `fixedPrice` é sempre somado (é a fundação, nunca desliga). Os itens em
 * `configurator.variableItems` são as camadas que a cliente adiciona por cima, cada um com seu
 * `price` somado só quando ativo. "videos" tem `unlockedBy: "posicionamento"` — só aparece (e só
 * conta no total) quando o toggle "posicionamento" está ativo:
 *   Posicionamento OFF                              → 3.500 (só a fundação)
 *   Posicionamento ON (+1.200) + 4 vídeos (+1.500)   → 6.200
 *   Posicionamento ON (+1.200) + 8 vídeos (+2.300)   → 7.000
 *   + Tráfego pago (+500), + Estratégia de prospecção ativa (+900), cada um somando por cima
 *     de qualquer configuração acima.
 * Pra mudar um valor: edite só o `price` do item correspondente (ou `fixedPrice`) — o total em
 * proposal-configurator.tsx é sempre fixedPrice + soma dos itens variáveis ativos.
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
    heading: "",
    fixedLabel: "Estrutura fixa",
    fixedPrice: 3500,
    fixedItems: [
      { id: "estrategia-marketing", label: "Estratégia de marketing" },
      { id: "linha-editorial", label: "Linha editorial de conteúdo" },
      { id: "roteirizacao", label: "Roteirização" },
      { id: "programa-tv", label: "Produção do programa Cara a Cara com a Beleza" },
    ],
    variableLabel: "O que pode adicionar",
    variableItems: [
      { kind: "toggle", id: "posicionamento", label: "Posicionamento", price: 1200, defaultOn: false },
      {
        kind: "video-tier",
        id: "videos",
        label: "Conteúdo em vídeo",
        unlockedBy: "posicionamento",
        defaultOptionId: "8",
        options: [
          { id: "4", count: 4, label: "4 vídeos/mês", price: 1500 },
          { id: "8", count: 8, label: "8 vídeos/mês", price: 2300 },
        ],
      },
      { kind: "toggle", id: "trafego-pago", label: "Tráfego pago", price: 500, defaultOn: false },
      { kind: "toggle", id: "prospeccao-ativa", label: "Estratégia de prospecção ativa", price: 900, defaultOn: false },
    ],
  },

  closing: {
    heading: "A próxima etapa começa aqui.",
    paragraph: "Uma parceria estratégica contínua até dezembro de 2026 — construída, ajustada e revisada junto com a Elenita a cada etapa.",
  },
};
