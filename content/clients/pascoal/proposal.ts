import type { PascoalProposalContent } from "@/lib/pascoal-proposal/types";

/**
 * Proposta de Continuidade — Pascoal Bombas. Página comercial isolada
 * (`/clients/pascoal/public/proposta`, servida via rewrite — ver `next.config.mjs` — por um app
 * route próprio em `app/pascoal-proposta/page.tsx`).
 *
 * VERSÃO FINAL (execução única) — dirigida à Júlia, sócia/responsável pela Pascoal Bombas, já
 * alinhada numa reunião anterior. Substitui inteiramente o criador conversacional e a matriz de
 * preços por combinação (perfis × vídeos) da versão anterior: agora é uma proposta estática, com
 * um único preço final.
 *
 * PREÇOS — dados diretamente no pedido, sem cálculo:
 *   R$ 3.500/mês por perfil trabalhado isoladamente
 *   R$ 10.500/mês = referência de comparação (3 × 3.500), exibida riscada/discreta, nunca como
 *     preço a pagar
 *   R$ 7.500/mês = preço final do pacote completo (3 perfis — os 2 da loja + o pessoal da
 *     Júlia), em destaque. Vale para o mês de teste E para o plano de 6 meses subsequente, mesmo
 *     valor nas duas fases.
 */
export const pascoalProposal: PascoalProposalContent = {
  slug: "pascoal",
  brandName: "Pascoal Bombas",
  accentColor: "#d4af6a",
  metaTitle: "Proposta de Continuidade — Pascoal Bombas",
  metaDescription: "Uma parceria estratégica de marketing.",

  hero: {
    eyebrow: "Proposta de continuidade",
    title: "Construindo os próximos capítulos da Pascoal Bombas",
  },

  operationSystem: {
    badge: "Proposta de continuidade",
    heading: "Como projetamos sua operação",
    paragraph: "Não são ações soltas. É um sistema: cada perfil, cada conteúdo e cada métrica trabalham conectados, na mesma direção.",
  },

  positioning: {
    heading: "Posicionamento",
    cards: [
      { title: "Captação de Conteúdo", description: "Produção presencial organizada por pauta, respeitando o ritmo de cada perfil." },
      { title: "Produção de Vídeos", description: "Edição e finalização com identidade própria para cada linha editorial." },
    ],
  },

  scope: {
    heading: "O que a proposta contempla",
    items: [
      { title: "Linha editorial para os 3 perfis", description: "Posicionamento, temas, formatos e direcionamento de conteúdo definidos para cada perfil." },
      { title: "Criação de conteúdo para os 3 perfis", description: "Estratégia conectada entre eles, respeitando o objetivo e o posicionamento individual de cada um." },
      { title: "Tráfego pago para o perfil da Pascoal", description: "Foco em geração de oportunidades e crescimento comercial." },
      { title: "Aquisição de empresas via WhatsApp (Pascoal)", description: "Campanhas específicas para alcançar empresas e transformar tráfego em conversas comerciais." },
      { title: "Projeto completo do Perfil Pro da Júlia", description: "Do posicionamento à apresentação visual e estratégica do perfil profissional." },
      { title: "Social Media dedicado ao perfil da Júlia", description: "Rotina de posts, organização de conteúdo e execução da linha editorial definida." },
    ],
    closing: "A intenção não é apenas produção de posts ou tráfego isolado — é a construção de uma estrutura digital que une posicionamento, conteúdo, aquisição e comercial em uma única operação.",
  },

  format: {
    heading: "Formato: teste e continuidade",
    steps: [
      { number: "01", title: "Mês de teste", description: "Um primeiro mês para colocar toda a estrutura em prática, validar o funcionamento da estratégia e entender os primeiros resultados." },
      { number: "02", title: "Plano de 6 meses", description: "Com tudo validado e ajustado no mês de teste, a operação segue para um plano de 6 meses, com estratégia de crescimento mais estruturada e contínua." },
    ],
  },

  investment: {
    heading: "Investimento",
    perfilLabel: "Cada perfil trabalhado isoladamente",
    perfilPrice: 3500,
    referenceLabel: "Referência para os 3 perfis somados",
    referencePrice: 10500,
    finalPrice: 7500,
    reinforcement: "Abaixo da soma dos valores individuais trabalhando os 3 perfis separadamente.",
    note: "Esse valor vale para o mês de teste e segue o mesmo durante o plano de 6 meses seguinte — uma única operação, do início à continuidade.",
  },

  whatsapp: {
    // Exatamente os dígitos do número informado ("+55 51 98202-05917") — 14 dígitos, 1 a mais
    // que o padrão de celular BR (13). Não corrigido por conta própria; vale conferir.
    phoneDigits: "55519820205917",
    ceoFirstName: "Santiago",
  },

  cta: {
    label: "Fechar proposta",
    note: "Seu escopo será enviado diretamente para nossa equipe.",
  },
};
