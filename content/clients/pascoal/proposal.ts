import type { PascoalProposalContent } from "@/lib/pascoal-proposal/types";

/**
 * Proposta de Continuidade — Pascoal Bombas. Página comercial isolada
 * (`/clients/pascoal/public/proposta`, servida via rewrite — ver `next.config.mjs` — por um app
 * route próprio em `app/pascoal-proposta/page.tsx`).
 *
 * REFORMULAÇÃO DE COPY (pedido explícito) — regras seguidas em todo o arquivo:
 *   - Nenhum travessão (—) em lugar nenhum. Ideias conectadas com ponto final, dois pontos, ou
 *     frase reestruturada.
 *   - Sem frases de efeito vazias ("não são ações soltas, é um sistema" e afins foram cortadas).
 *   - Os 3 perfis (Pascoal Bombas Zona Sul, Pascoal Bombas Zona Norte, Julia Brigidio) nomeados
 *     explicitamente já na primeira seção depois do Hero, cada um com a estratégia dele.
 *
 * PREÇOS — inalterados, dados diretamente pelo cliente, sem cálculo:
 *   R$ 3.500/mês por perfil trabalhado isoladamente
 *   R$ 10.500/mês = referência de comparação (3 × 3.500), exibida riscada/discreta
 *   R$ 7.500/mês = preço final cobrindo os 2 perfis de loja (Zona Sul + Zona Norte) e o perfil
 *     pessoal da Julia. Vale para o mês de teste e para o plano de 6 meses subsequente.
 */
export const pascoalProposal: PascoalProposalContent = {
  slug: "pascoal",
  brandName: "Pascoal Bombas",
  accentColor: "#d4af6a",
  metaTitle: "Proposta de Continuidade: Pascoal Bombas",
  metaDescription: "Uma parceria estratégica de marketing.",

  hero: {
    eyebrow: "Proposta de continuidade",
    title: "Construindo os próximos capítulos da Pascoal Bombas",
  },

  operationSystem: {
    badge: "Proposta de continuidade",
    heading: "Como projetamos sua operação",
    paragraph: "São 3 perfis, cada um com uma estratégia própria. As duas lojas focam em prospecção comercial e tráfego pago. O perfil da Julia foca em autoridade profissional. Todos seguem a mesma identidade visual e o mesmo calendário de conteúdo.",
    profiles: [
      { name: "Pascoal Bombas Zona Sul", tag: "Loja", strategy: "Prospecção de parceiros comerciais e tráfego pago para ampliar o alcance dos vídeos, gerando contato via WhatsApp com outras empresas." },
      { name: "Pascoal Bombas Zona Norte", tag: "Loja", strategy: "Mesma estratégia da Zona Sul: prospecção comercial e tráfego pago, com pauta e ritmo próprios." },
      { name: "Julia Brigidio", tag: "Perfil pessoal", strategy: "Construção de autoridade profissional, com social media dedicada cuidando da rotina de posts." },
    ],
    diagramCaption: "Estratégias diferentes. Identidade visual e calendário compartilhados.",
  },

  positioning: {
    heading: "Posicionamento",
    cards: [
      { title: "Captação de Conteúdo", description: "Uma gravação mensal alimenta os 3 perfis: material organizado por pauta, pronto para virar conteúdo das duas lojas e do perfil da Julia." },
      { title: "Produção de Vídeos", description: "Cada vídeo é editado para o perfil que vai publicá-lo: tom comercial nas lojas, tom pessoal no perfil da Julia." },
    ],
  },

  scope: {
    heading: "O que a proposta contempla",
    groups: [
      {
        label: "Base para os 3 perfis",
        tag: "Fundação",
        items: [
          { title: "Linha editorial para os 3 perfis", description: "Pauta, formato e frequência definidos para cada perfil, dentro do mesmo calendário de conteúdo." },
          { title: "Criação de conteúdo para os 3 perfis", description: "Produção mensal que abastece as duas lojas e o perfil da Julia com o mesmo material captado." },
        ],
      },
      {
        label: "Zona Sul e Zona Norte",
        tag: "Lojas",
        items: [
          { title: "Tráfego pago para os vídeos", description: "Impulsionamento para ampliar o alcance além de quem já segue o perfil." },
          { title: "Prospecção comercial via WhatsApp", description: "Campanhas voltadas a outras empresas, com o objetivo de gerar contato comercial direto." },
        ],
      },
      {
        label: "Julia Brigidio",
        tag: "Perfil pessoal",
        items: [
          { title: "Perfil Pro completo", description: "Estruturação do perfil profissional, do posicionamento à apresentação visual." },
          { title: "Social media dedicada", description: "Rotina de posts e execução da linha editorial, com atenção exclusiva ao perfil." },
        ],
      },
    ],
    closing: "As lojas buscam contato comercial. A Julia constrói autoridade. Os dois lados seguem a mesma identidade visual, no mesmo calendário.",
  },

  format: {
    heading: "Formato: teste e continuidade",
    steps: [
      { number: "01", title: "Mês de teste", description: "Um mês para colocar a operação em prática. No fim dele, revisamos os resultados junto com você." },
      { number: "02", title: "Plano de 6 meses", description: "Com o que funcionou validado no teste, seguimos por 6 meses de operação contínua, com ajustes mensais conforme os resultados." },
    ],
  },

  investment: {
    heading: "Investimento",
    coverageNote: "Uma operação cobrindo os 2 perfis das lojas (Zona Sul e Zona Norte) e o perfil pessoal da Julia.",
    perfilLabel: "Cada perfil trabalhado isoladamente",
    perfilPrice: 3500,
    referenceLabel: "Referência para os 3 perfis somados",
    referencePrice: 10500,
    finalPrice: 7500,
    reinforcement: "Menor que a soma dos 3 perfis contratados separadamente.",
    note: "Esse valor vale para o mês de teste e continua o mesmo durante o plano de 6 meses seguinte.",
  },

  whatsapp: {
    // Exatamente os dígitos do número informado ("+55 51 98202-05917") — 14 dígitos, 1 a mais
    // que o padrão de celular BR (13). Não corrigido por conta própria; vale conferir.
    phoneDigits: "55519820205917",
    ceoFirstName: "Santiago",
  },

  cta: {
    label: "Fechar proposta",
    note: "Retorno da nossa equipe em até 1 dia útil, pelo WhatsApp, com os próximos passos.",
  },
};
