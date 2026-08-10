import type { ProposalContent } from "@/lib/clients/proposal-types";

/**
 * Proposta de Continuidade — Dra. Elenita Luzardo. Página comercial isolada
 * (`/clients/elenita/public/proposta`), conteúdo próprio, não reaproveita nada de
 * `content/clients/elenita/public.ts` (a apresentação pública) nem de `workspace.ts`.
 */
export const elenitaProposal: ProposalContent = {
  slug: "elenita",
  brandName: "Dra. Elenita Luzardo",
  accentColor: "#b76e79",
  metaTitle: "Proposta de Continuidade — Dra. Elenita Luzardo",
  metaDescription: "Uma parceria estratégica de marketing até dezembro de 2026.",

  hero: {
    eyebrow: "Proposta de continuidade · Agosto — Dezembro 2026",
    title: "A próxima fase da marca Elenita",
    subtitle:
      "Uma parceria estratégica de marketing para transformar posicionamento, conteúdo, audiência e oportunidades comerciais em uma operação contínua até dezembro de 2026.",
    dateRange: "Agosto → Dezembro 2026",
    ctaLabel: "Construir essa próxima etapa",
    ctaHref: "#configurador",
  },

  positioning: {
    eyebrow: "Mais do que uma produtora",
    heading: "Mais do que produzir conteúdo. Construir crescimento.",
    paragraphs: [
      "O próximo passo do nosso trabalho é transformar a comunicação da Elenita em uma operação contínua de posicionamento, conteúdo e crescimento.",
      "Acreditamos que existe uma oportunidade muito maior do que simplesmente produzir novos vídeos.",
      "Queremos construir uma presença digital que fortaleça sua autoridade, amplie sua audiência, potencialize o programa de TV e crie novas oportunidades comerciais através de marcas e patrocinadores.",
      "Por isso, nossa proposta é estabelecer uma parceria estratégica até dezembro de 2026.",
    ],
  },

  pillars: [
    {
      title: "Posicionamento",
      description: "Construção e evolução do posicionamento da Elenita como autoridade.",
      items: ["Direcionamento estratégico", "Linha editorial", "Pilares de comunicação", "Estratégia de autoridade", "Planejamento mensal"],
    },
    {
      title: "Conteúdo",
      description: "Operação contínua de conteúdo.",
      items: ["Planejamento", "Escrita de roteiros", "Direção", "Captação", "Edição", "Entrega"],
    },
    {
      title: "Programa de TV",
      description: "Transformar o programa em um ativo de autoridade e posicionamento.",
      items: ["Planejamento do programa", "Desenvolvimento de pautas", "Estrutura dos episódios", "Estratégia de conteúdo", "Direcionamento de produção", "Integração com redes sociais"],
    },
    {
      title: "Crescimento de audiência",
      description: "Estratégias pontuais de tráfego pago para crescimento de seguidores.",
      items: ["Planejamento das campanhas", "Definição de públicos", "Estruturação dos anúncios", "Otimização", "Análise de resultados"],
      note: "A verba de mídia paga não está incluída no investimento mensal.",
    },
    {
      title: "Patrocinadores",
      description: "Estratégia comercial para transformar o programa em uma plataforma atrativa para marcas.",
      items: ["Definição do perfil de patrocinadores", "Estratégia de prospecção", "Estrutura de abordagem", "Organização do processo comercial", "Estratégia de apresentação do projeto"],
    },
  ],

  configurator: {
    eyebrow: "Monte a operação",
    heading: "Configurador da operação",
    subtitle: "Aumente ou diminua o escopo — o valor mensal é recalculado na hora. Não é aceitar ou recusar uma proposta fechada: é montar a operação no nível certo para este momento.",
    videoTiersLabel: "Vídeos por mês",
    videoTiers: [
      { id: "4", count: 4, label: "4 vídeos/mês", price: 6500 },
      { id: "8", count: 8, label: "8 vídeos/mês", price: 8500, recommended: true },
      { id: "12", count: 12, label: "12 vídeos/mês", price: 10000 },
    ],
    modulesLabel: "Módulos estratégicos",
    includedModule: { label: "Posicionamento", description: "Incluído na operação recomendada." },
    optionalModules: [
      { id: "tv", label: "Programa de TV", description: "Planejamento, pautas, estrutura de episódios e integração com redes sociais.", price: 1500 },
      { id: "audiencia", label: "Crescimento de audiência", description: "Estratégia de tráfego pago para crescimento de seguidores (verba à parte).", price: 1000 },
      { id: "patrocinio", label: "Prospecção de patrocinadores", description: "Estrutura comercial para transformar o programa em plataforma para marcas.", price: 1500 },
    ],
  },

  recommendation: {
    eyebrow: "Nossa recomendação",
    heading: "8 vídeos/mês com Posicionamento incluído — o ponto de partida ideal para esta fase.",
    contractNote: "Contrato de continuidade até dezembro de 2026.",
    ctaLabel: "Quero essa operação",
    ctaHref: "#configurador",
  },

  investmentNote: {
    heading: "O valor não representa apenas vídeos",
    paragraphs: [
      "Os vídeos são apenas uma parte da operação.",
      "O investimento contempla uma estrutura contínua de marketing, posicionamento, estratégia, produção de conteúdo, desenvolvimento do programa, crescimento de audiência e criação de oportunidades comerciais.",
      "A quantidade de conteúdo e os módulos estratégicos podem ser ajustados conforme as prioridades da Elenita.",
    ],
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
    paragraphs: ["Não estamos propondo apenas continuar produzindo conteúdo.", "Estamos propondo construir, juntos, a próxima fase da marca Elenita."],
    dateRange: "Agosto → Dezembro 2026",
    ctaLabel: "Começar parceria",
    ctaHref: "#configurador",
  },
};
