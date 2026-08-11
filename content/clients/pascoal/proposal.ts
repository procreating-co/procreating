import type { PascoalProposalContent } from "@/lib/pascoal-proposal/types";

/**
 * Proposta de Continuidade — Pascoal Bombas. Página comercial isolada
 * (`/clients/pascoal/public/proposta`, servida via rewrite — ver `next.config.mjs` — por um app
 * route próprio em `app/pascoal-proposta/page.tsx`).
 *
 * PREÇOS — a lógica existente foi PRESERVADA de propósito (pedido explícito: "a lógica de preço
 * existente deve ser preservada quando correta"). Só temos 3 valores-base confirmados:
 *   1 oficina × 4 vídeos = R$ 3.500 · 2 oficinas × 4 vídeos = R$ 4.500 · 3 oficinas × 4 vídeos = R$ 5.000
 * As combinações ×8 vídeos continuam `price: null` — ainda não definidas, não inventei fórmula.
 * "perfis" foi renomeado pra "oficinas" (linguagem da própria Pascoal). Os números "R$ 4.860" e
 * "R$ 5.360" que apareceram nos exemplos de UX do pedido NÃO foram usados como preço real aqui —
 * tratei como texto ilustrativo de mockup, já que não batem com nenhum dos 3 valores confirmados
 * e a instrução era preservar a lógica já validada, não substituí-la. Se esses números eram pra
 * ser preços novos de verdade, me avise que eu ajusto.
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

  servicePillars: [
    {
      title: "Assessoria de Marketing",
      copy: "Construímos a direção estratégica que orienta todas as decisões de marketing da Pascoal Bombas.",
      bullets: ["Estratégia de Marketing", "Planejamento e Linha Editorial", "Estratégias de Comunicação", "Roteiros e Direcionamentos", "Planejamento de Campanhas"],
      closing: "Você não recebe apenas ideias. Recebe uma direção clara para executar.",
      exclusions: {
        label: "Não contempla execução",
        items: ["Captação de Conteúdo", "Edição de Vídeos", "Postagem e Gestão de Redes", "Metrificação Operacional"],
      },
    },
    {
      title: "Plano de Posicionamento",
      copy: "Transformamos estratégia em presença digital consistente, criando uma comunicação que fortalece autoridade e percepção de marca.",
      bullets: ["Captação de Conteúdo", "Roteiros e Pautas", "Edição de Vídeos", "Gestão de Redes", "Publicação e Metrificação"],
      closing: "Do planejamento à presença: uma operação pensada para construir percepção.",
    },
    {
      title: "Crescimento e Aquisição",
      copy: "Conectamos marketing e oportunidades comerciais para transformar atenção em relacionamento e relacionamento em negócio.",
      bullets: ["Estratégias Comerciais", "Tráfego Pago", "Prospecção Ativa", "Oportunidades Comerciais", "Parcerias Estratégicas"],
      closing: "Mais do que gerar alcance, criamos caminhos para gerar oportunidades.",
    },
  ],

  configurator: {
    base: {
      label: "Assessoria de Marketing",
      stepLabel: "Estrutura estratégica",
      includedItem: "Direção estratégica, planejamento e linha editorial — sempre inclusos",
      price: 3500,
    },
    steps: {
      content: {
        stepLabel: "Escolha sua operação de conteúdo",
        moduleLabel: "Plano de Posicionamento",
        moduleBenefit: "Transforme estratégia em presença digital consistente, com captação, edição e publicação mensal.",
        triggerLabel: "Captação de Conteúdo e Gestão de Redes",
        highlightTag: "Recomendado",
        oficinaOptions: [
          { value: 1, label: "01 Oficina" },
          { value: 2, label: "02 Oficinas" },
          { value: 3, label: "03 Oficinas" },
        ],
        videoOptions: [
          { value: 4, label: "04 vídeos" },
          { value: 8, label: "08 vídeos" },
        ],
        prices: [
          { oficinas: 1, videos: 4, price: 3500 },
          { oficinas: 2, videos: 4, price: 4500 },
          { oficinas: 3, videos: 4, price: 5000 },
          // Ainda não definidos pela Pascoal — ver comentário no topo do arquivo.
          { oficinas: 1, videos: 8, price: null },
          { oficinas: 2, videos: 8, price: null },
          { oficinas: 3, videos: 8, price: null },
        ],
      },
      growth: {
        stepLabel: "Acelere a aquisição",
        toggles: [
          { id: "trafego-pago", label: "Gestão de Tráfego Pago", benefit: "Amplie o alcance da marca com campanhas segmentadas e otimizadas.", price: 500 },
          { id: "prospeccao-ativa", label: "Prospecção Ativa de Empresas", benefit: "Uma estratégia ativa de conexão com empresas com potencial de negócio.", price: 1500 },
        ],
      },
    },
  },

  whatsapp: {
    // Exatamente os dígitos do número informado ("+55 51 98202-05917"). Vale conferir: tem 14
    // dígitos, 1 a mais que o padrão de celular BR (13) — não corrigi por conta própria, usei
    // literalmente o que foi passado.
    phoneDigits: "55519820205917",
    ceoFirstName: "Santiago",
  },

  cta: {
    label: "Quero avançar com este plano",
    note: "Seu escopo será enviado diretamente para nossa equipe.",
    confirmationHeading: "Seu plano está pronto.",
    confirmationSubheading: "Você está avançando com esta estrutura:",
    confirmedLabel: "Avançar pelo WhatsApp",
  },
};
