import type { PascoalProposalContent } from "@/lib/pascoal-proposal/types";

/**
 * Proposta de Continuidade — Pascoal Bombas. Página comercial isolada
 * (`/clients/pascoal/public/proposta`, servida via rewrite — ver `next.config.mjs` — por um app
 * route próprio em `app/pascoal-proposta/page.tsx`), pensada pra apresentação AO VIVO — sem
 * nenhum CTA comercial, o configurador é a própria ferramenta de apresentação.
 *
 * Estrutura equivalente à proposta da Elenita (`content/clients/elenita/proposal.ts`), mas com
 * conteúdo, textos e headline próprios da Pascoal — nenhum texto copiado de lá.
 *
 * PREÇOS AINDA NÃO DEFINIDOS — todo valor comercial abaixo está zerado de propósito (era assim
 * já na versão anterior desta proposta; não inventei nada novo aqui, só migrei os mesmos
 * placeholders pra estrutura nova). `fixedPrice` é a fundação, sempre somada. Os itens em
 * `configurator.variableItems` somam por cima, cada um só quando ativo — "videos" só aparece (e
 * só conta) quando o toggle "posicionamento" está ligado (`unlockedBy: "posicionamento"`), mesma
 * lógica da Elenita. Pra definir os valores reais: edite só o `price` de cada item (ou
 * `fixedPrice`) — nunca espalhe preço em outro lugar. O total em
 * components/proposal-pascoal/proposal-pascoal-configurator.tsx é sempre
 * fixedPrice + soma dos itens variáveis ativos.
 */
export const pascoalProposal: PascoalProposalContent = {
  slug: "pascoal",
  brandName: "Pascoal Bombas",
  accentColor: "#d4af6a",
  metaTitle: "Proposta de Continuidade — Pascoal Bombas",
  metaDescription: "Uma parceria estratégica de marketing.",

  hero: {
    eyebrow: "Marketing estratégico contínuo",
    title: "Construindo o próximo capítulo da Pascoal",
    subtitle: "Estratégia, conteúdo e crescimento trabalhando na mesma direção.",
  },

  pillarsIntro: {
    eyebrow: "",
    heading: "O que propomos",
    subtitle: "Uma operação estratégica de marketing, em diferentes frentes.",
  },

  pillars: [
    {
      number: "01",
      title: "Estratégia",
      description: "A camada que orquestra todas as outras.",
      items: ["Direcionamento estratégico da marca", "Planejamento mensal de ações", "Leitura de oportunidades de mercado", "Integração entre conteúdo e comercial"],
    },
    {
      number: "02",
      title: "Posicionamento",
      description: "Como a estratégia vira presença.",
      items: ["Produção de conteúdo institucional e técnico", "Roteiro e direção de captação", "Presença digital consistente", "Construção de autoridade no setor"],
    },
    {
      number: "03",
      title: "Crescimento",
      description: "A aceleração da marca.",
      items: ["Tráfego pago segmentado", "Distribuição estratégica de conteúdo", "Otimização orientada por dados", "Expansão de alcance e audiência"],
    },
  ],

  operacao: {
    eyebrow: "Como a estratégia vira entrega",
    heading: "Operação de conteúdo",
    subtitle: "Um fluxo mensal que transforma direcionamento estratégico em conteúdo pronto pra publicar.",
    steps: ["Planejamento", "Pauta", "Roteiro", "Produção", "Edição", "Publicação"],
  },

  acquisition: {
    eyebrow: "Além do conteúdo",
    heading: "Estratégia de aquisição",
    cards: [
      {
        number: "01",
        title: "Mapeamento",
        description: "Identificação de empresas e parceiros com potencial real de negócio.",
        items: ["Mapeamento de mercado", "Definição de perfis estratégicos", "Identificação de oportunidades", "Listas qualificadas"],
      },
      {
        number: "02",
        title: "Abordagem",
        description: "Aproximação estruturada com quem tem potencial concreto de conversão.",
        items: ["Abordagem direta", "Apresentação técnica e comercial", "Construção de relacionamento", "Acompanhamento estruturado"],
      },
      {
        number: "03",
        title: "Conexão",
        description: "Fortalecimento do relacionamento com clientes e parceiros estratégicos.",
        items: ["Relacionamento comercial", "Parcerias técnicas", "Presença no setor", "Construção de autoridade"],
      },
      {
        number: "04",
        title: "Conversão",
        description: "Transformação de oportunidades qualificadas em negócio fechado.",
        items: ["Proposta comercial", "Negociação", "Fechamento", "Acompanhamento pós-venda"],
      },
      {
        number: "05",
        title: "Crescimento",
        description: "Aquisição não termina no primeiro contato — é um ciclo contínuo.",
        items: ["Novas conexões", "Novas oportunidades", "Maior alcance", "Maior autoridade"],
      },
    ],
  },

  configurator: {
    heading: "",
    fixedLabel: "Estrutura fixa",
    // Valor ainda não definido — ver comentário no topo do arquivo.
    fixedPrice: 0,
    fixedItems: [
      { id: "estrategia-marketing", label: "Estratégia de marketing" },
      { id: "linha-editorial", label: "Linha editorial de conteúdo" },
      { id: "roteirizacao", label: "Roteirização" },
      { id: "acompanhamento", label: "Acompanhamento mensal de performance" },
    ],
    variableLabel: "O que pode adicionar",
    variableItems: [
      // Valores ainda não definidos — todos zerados de propósito, ver comentário no topo do arquivo.
      { kind: "toggle", id: "posicionamento", label: "Posicionamento", price: 0, defaultOn: false },
      {
        kind: "video-tier",
        id: "videos",
        label: "Conteúdo em vídeo",
        unlockedBy: "posicionamento",
        defaultOptionId: "8",
        options: [
          { id: "4", count: 4, label: "4 vídeos/mês", price: 0 },
          { id: "8", count: 8, label: "8 vídeos/mês", price: 0 },
        ],
      },
      { kind: "toggle", id: "trafego-pago", label: "Tráfego pago", price: 0, defaultOn: false },
      { kind: "toggle", id: "prospeccao-ativa", label: "Estratégia de prospecção ativa", price: 0, defaultOn: false },
    ],
  },

  closing: {
    heading: "O próximo passo é agora.",
    paragraph: "Uma parceria estratégica contínua — construída, ajustada e revisada junto com a Pascoal a cada etapa.",
  },
};
