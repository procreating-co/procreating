import type { PascoalProposalContent } from "@/lib/pascoal-proposal/types";

/**
 * Proposta de Continuidade — Pascoal Bombas. Página comercial isolada
 * (`/clients/pascoal/public/proposta`, servida via rewrite — ver `next.config.mjs` — por um app
 * route próprio em `app/pascoal-proposta/page.tsx`), pensada pra apresentação AO VIVO — sem
 * nenhum CTA comercial, o configurador é a própria ferramenta de apresentação.
 *
 * PREÇOS — atualização cirúrgica pedida explicitamente com valores reais:
 *   - Plano Inicial (Assessoria de Marketing, sempre incluso): R$ 3.500
 *   - Criação de Conteúdo (perfis × vídeos) SUBSTITUI o Plano Inicial quando ativo, não soma:
 *       1 perfil × 4 vídeos = R$ 3.500 · 2 perfis × 4 vídeos = R$ 4.500 · 3 perfis × 4 vídeos = R$ 5.000
 *       1/2/3 perfis × 8 vídeos = ainda não definido pela Pascoal (`price: null`) — só temos os 3
 *       valores-base de 4 vídeos. NÃO inventei uma fórmula pra extrapolar os de 8 vídeos (dobrar,
 *       interpolar etc. geraria um preço incoerente sem confirmação); a UI mostra "Valor a
 *       definir" pra essas 3 combinações em vez de um número. Pra definir: preencher o `price`
 *       correspondente em `configurator.content.prices` abaixo.
 *   - Gestão de Tráfego Pago: +R$ 500/mês · Prospecção Ativa de Empresas: +R$ 1.500/mês (somam
 *     sobre o valor atual, seja ele o Plano Inicial ou uma combinação de conteúdo)
 * Toda a lógica de cálculo mora em components/proposal-pascoal/proposal-pascoal-configurator.tsx;
 * pra mudar um valor, edite só os números aqui.
 */
export const pascoalProposal: PascoalProposalContent = {
  slug: "pascoal",
  brandName: "Pascoal Bombas",
  accentColor: "#d4af6a",
  metaTitle: "Proposta de Continuidade — Pascoal Bombas",
  metaDescription: "Uma parceria estratégica de marketing.",

  hero: {
    eyebrow: "Proposta de continuidade",
    title: "Construindo o próximo capítulo da Pascoal Bombas",
  },

  pillarsIntro: {
    badge: "Proposta de continuidade",
    heading: "Nossos serviços",
  },

  pillars: [
    {
      number: "01",
      title: "Assessoria de Marketing",
      items: ["Estratégias de Marketing", "Roteiros de Conteúdo"],
    },
    {
      number: "02",
      title: "Criação de Conteúdo",
      items: ["Captação de Conteúdo", "Roteiros de Conteúdo", "Edição de Vídeos", "Postagem e Metrificação"],
    },
    {
      number: "03",
      title: "Crescimento e Aquisição",
      items: ["Estratégias Comerciais", "Gestão de Campanhas de Tráfego Pago", "Gestão Estratégica de Oportunidades Comerciais"],
    },
  ],

  methodology: [
    {
      number: "01",
      title: "Assessoria",
      paragraph:
        "Começamos pela estratégia. Estruturamos direcionamentos de marketing, planejamentos e roteiros para transformar objetivos comerciais em ações claras de conteúdo e aquisição.",
      tags: ["Estratégia", "Planejamento", "Roteiros", "Direcionamento"],
    },
    {
      number: "02",
      title: "Posicionamento",
      paragraph:
        "Transformamos estratégia em presença. Cuidamos de toda a operação de conteúdo para posicionar a Pascoal Bombas nas redes sociais — da pauta e dos roteiros à captação, edição, publicação e metrificação.",
      tags: ["Roteiros", "Captação", "Edição", "Publicação", "Metrificação"],
    },
    {
      number: "03",
      title: "Aquisição",
      paragraph:
        "Ampliamos as oportunidades comerciais através de uma estratégia de aquisição integrada. Trabalhamos marketing digital, campanhas, prospecção e parcerias para criar novas possibilidades de crescimento.",
      tags: ["Marketing Digital", "Tráfego Pago", "Prospecção", "Parcerias", "Oportunidades Comerciais"],
    },
  ],

  configurator: {
    planInitial: {
      label: "Plano Inicial",
      includedLabel: "Sempre inclusos",
      includedItem: "Assessoria de Marketing",
      price: 3500,
    },
    additionsLabel: "O que pode adicionar",
    additionsSubtitle: "Planos Adicionais",
    content: {
      moduleLabel: "Posicionamento",
      triggerLabel: "Criação de Conteúdo",
      profileOptions: [
        { value: 1, label: "01 perfil" },
        { value: 2, label: "02 perfis" },
        { value: 3, label: "03 perfis" },
      ],
      videoOptions: [
        { value: 4, label: "04 vídeos" },
        { value: 8, label: "08 vídeos" },
      ],
      prices: [
        { profiles: 1, videos: 4, price: 3500 },
        { profiles: 2, videos: 4, price: 4500 },
        { profiles: 3, videos: 4, price: 5000 },
        // Ainda não definidos pela Pascoal — ver comentário no topo do arquivo.
        { profiles: 1, videos: 8, price: null },
        { profiles: 2, videos: 8, price: null },
        { profiles: 3, videos: 8, price: null },
      ],
    },
    growth: {
      moduleLabel: "Crescimento e Aquisição",
      toggles: [
        { id: "trafego-pago", label: "Gestão de Tráfego Pago", price: 500 },
        { id: "prospeccao-ativa", label: "Prospecção Ativa de Empresas", price: 1500 },
      ],
    },
  },

  closing: {
    heading: "O próximo passo é agora.",
    paragraph: "Uma parceria estratégica contínua — construída, ajustada e revisada junto com a Pascoal a cada etapa.",
  },
};
