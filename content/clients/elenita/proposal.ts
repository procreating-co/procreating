import type { ProposalContent } from "@/lib/clients/proposal-types";

/**
 * Proposta de Continuidade — Dra. Elenita Luzardo. Página comercial isolada
 * (`/clients/elenita/public/proposta`), pensada pra apresentação AO VIVO.
 *
 * PREÇOS DO ORÇAMENTO — proposta inicial, ajustar livremente (pedido explícito: "proponha você
 * uma divisão razoável e eu ajusto depois"). Só 4 itens têm peso no total (o resto é sempre
 * incluso, sem afetar o valor): vídeos (4 ou 8), Programa de TV, Tráfego pago, Prospecção ativa.
 *   8 vídeos (4000) + Programa de TV (800) + Tráfego pago (500) + Prospecção ativa (900) = 6.200
 *   4 vídeos (3200) + Programa de TV (800) + Tráfego pago (500) + Prospecção ativa (900) = 5.400
 * Pra mudar um valor: edite só o `price` do item correspondente abaixo — o total em
 * proposal-configurator.tsx é sempre a soma dos itens ativos, nunca precisa mexer no componente.
 */
export const elenitaProposal: ProposalContent = {
  slug: "elenita",
  brandName: "Dra. Elenita Luzardo",
  accentColor: "#b76e79",
  metaTitle: "Proposta de Continuidade — Dra. Elenita Luzardo",
  metaDescription: "Uma parceria estratégica de marketing.",

  hero: {
    eyebrow: "Parceria estratégica de marketing",
    title: "Uma nova era começa agora.",
    subtitle: "Uma estrutura contínua para fortalecer marca, audiência e oportunidades.",
  },

  pillarsIntro: {
    eyebrow: "O que propomos",
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
    heading: 'Produção de "Cara a Cara com a Beleza"',
    description: "Atuamos como produtores do programa — a reunião da primeira semana do mês organiza o fluxo completo do episódio.",
    steps: ["Reunião mensal", "Pautas", "Roteirização", "Direção", "Produção", "Acompanhamento"],
  },

  configurator: {
    heading: "Orçamento",
    groups: [
      {
        label: "Estratégia",
        items: [{ kind: "static", id: "estrategia-marketing", label: "Estratégias de Marketing" }],
      },
      {
        label: "Posicionamento",
        items: [
          { kind: "static", id: "posicionamento-digital", label: "Posicionamento Digital" },
          { kind: "static", id: "producao-conteudo", label: "Produção de conteúdo" },
          { kind: "static", id: "roteiros", label: "Roteiros" },
          { kind: "static", id: "conteudo-estrategico", label: "Conteúdo estratégico" },
        ],
      },
      {
        label: "Conteúdo",
        items: [
          {
            kind: "video-tier",
            id: "videos",
            defaultOptionId: "8",
            options: [
              { id: "4", count: 4, label: "4 vídeos/mês", price: 3200 },
              { id: "8", count: 8, label: "8 vídeos/mês", price: 4000 },
            ],
          },
          { kind: "static", id: "captacao-mensal", label: "Captação mensal" },
        ],
      },
      {
        label: "Programa",
        items: [{ kind: "toggle", id: "programa-tv", label: 'Produção de "Cara a Cara com a Beleza"', price: 800, defaultOn: true }],
      },
      {
        label: "Crescimento",
        items: [
          { kind: "toggle", id: "trafego-pago", label: "Tráfego pago", price: 500, defaultOn: true },
          { kind: "toggle", id: "prospeccao-ativa", label: "Estratégia de prospecção ativa", price: 900, defaultOn: true },
        ],
      },
    ],
  },

  closing: {
    heading: "A próxima etapa começa aqui.",
    paragraph: "Uma parceria estratégica contínua até dezembro de 2026 — construída, ajustada e revisada junto com a Elenita a cada etapa.",
  },
};
