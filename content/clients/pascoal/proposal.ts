import type { PascoalProposalContent } from "@/lib/pascoal-proposal/types";

/**
 * Proposta de Continuidade — Pascoal Bombas. Página comercial isolada
 * (`/clients/pascoal/public/proposta`, servida via rewrite — ver `next.config.mjs` — por um app
 * route próprio em `app/pascoal-proposta/page.tsx`).
 *
 * ══════════════════════════ MEMÓRIA DE CÁLCULO — NÃO EDITAR SEM REFAZER A CONTA ══════════════════════════
 * Regras de custo (dadas): imposto 6% sobre tudo · captação R$1.000/perfil, com 2+ perfis cai pra
 * R$800/perfil (desconto de escala 20%) · edição: avulso R$200/vídeo (pedido <8 vídeos no total),
 * pacote de 8 R$180/vídeo (pedido = exatamente 8 no total), grandes volumes piso R$150/vídeo
 * (pedido >8 no total, nunca abaixo disso).
 * Fórmula: preço = custos_operacionais / (1 − margem_alvo − 0.06)
 *
 * Base sempre incluída (Assessoria de Marketing, sem nenhum perfil selecionado): R$ 3.500 —
 * inalterada, não passou pela fórmula de custo de produção (é só a camada estratégica, sem
 * captação/edição envolvidas).
 *
 * MATRIZ NORMAL (até 2 perfis — Pascoal Zona Sul + Pascoal Zona Norte):
 *   1 perfil × 4 vídeos/perfil (total 4)  → custos = 1.000 (captação) + 800 (edição avulsa, 4×200)
 *                                          → preço = 1.800 / (1 − 0.52 − 0.06) = 1.800/0.42 ≈ 4.286
 *                                          → FIXADO em R$ 4.270 (valor dado, piso não-redutível;
 *                                            margem real ≈ 51,8% ≈ 52%, bate com o "margem≈52%" dado)
 *   1 perfil × 8 vídeos/perfil (total 8)  → custos = 1.000 + 1.440 (pacote de 8, 8×180) = 2.440
 *                                          → preço = 2.440 / 0.42 ≈ 5.809,5 → arredondado R$ 5.810
 *   2 perfis × 4 vídeos/perfil (total 8)  → custos = 1.600 (2×800, desconto) + 1.440 (pacote de 8)
 *                                          → preço = 3.040 / 0.42 ≈ 7.238 → arredondado R$ 7.240
 *                                          → TOPO da matriz normal, dentro do teto 7.000–8.000 ✓
 *   2 perfis × 8 vídeos/perfil (total 16) → NÃO OFERECIDO: custos = 1.600 + 2.400 (piso grande
 *                                            volume, 16×150) = 4.000 → preço ≈ 9.524, estouraria o
 *                                            teto de R$7.000–8.000 do topo da matriz normal. Por
 *                                            isso, com 2 perfis ativos a cadência de vídeo fica
 *                                            travada em 4/perfil — não é uma opção escondida, é
 *                                            matematicamente incompatível com o teto pedido.
 *   Nenhum valor termina em "90"; todos batem com a fórmula dada.
 *
 * PLANO COMPLETO (produto à parte, não combinação da matriz — valor e verificação de margem
 * dados diretamente no pedido, não recalculados aqui):
 *   R$ 7.000/mês fixo · captação 3×800=2.400 · edição 12×150 (piso grande volume)=1.800 ·
 *   imposto 6%×7.000=420 · margem = 7.000−2.400−1.800−420 = R$2.380 (≈34%) — mais apertada que a
 *   da matriz normal POR DESIGN (é o desconto de escala anunciado ao cliente). Se os custos de
 *   captação/edição subirem no futuro, revalidar antes de tocar no R$7.000.
 *
 * NOTA SOBRE OS EXEMPLOS "R$4.860"/"R$5.360" que já apareceram em pedidos anteriores: recalculei
 * com a fórmula de custo agora dada e nenhum deles bate matematicamente com nenhuma combinação
 * real (o mais próximo, 2 perfis × 4 vídeos, dá R$7.240, não R$4.860) — tratados como texto
 * ilustrativo de mockup, não como preço a fixar. Sinalizado de novo aqui por transparência.
 *
 * FLUXO CONVERSACIONAL (esta rodada): a Pergunta 3 ("frequência de publicação") do pedido é
 * sempre listada na sequência, mas com 2 perfis só existe 1 combinação de preço válida (4
 * vídeos/perfil — 2×8 não é oferecido, ver acima). Por isso, quando a Pergunta 1 = "2 perfis", a
 * Pergunta 3 é pulada silenciosamente (cadência fixada em "1 vídeo por semana"/4 vídeos) em vez
 * de expor uma opção ("2 vídeos por semana") que não tem preço válido — mesma lógica de "pular
 * pergunta cujo resultado já está implícito" que o próprio pedido usa pra Pergunta 2 com 2 perfis.
 * ═══════════════════════════════════════════════════════════════════════════════════════════
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

  servicesIntro: {
    badge: "Proposta de continuidade",
    heading: "Como Construímos Sua Operação",
  },

  serviceSteps: [
    {
      number: "01",
      title: "Assessoria de Marketing",
      copy: "Construímos a direção estratégica que orienta todas as decisões de marketing da Pascoal Bombas.",
      includesLabel: "Inclui",
      includeItems: ["Estratégia de Marketing", "Planejamento e Linha Editorial", "Estratégias de Comunicação", "Roteiros e Direcionamentos", "Planejamento de Campanhas"],
      excludesLabel: "Não contempla execução",
      excludeItems: ["Captação de Conteúdo", "Edição de Vídeos", "Postagem e Gestão de Redes", "Metrificação Operacional"],
      closing: "Você não recebe apenas ideias. Recebe uma direção clara para executar.",
    },
    {
      number: "02",
      title: "Plano de Posicionamento",
      copy: "Transformamos estratégia em presença digital consistente, criando uma comunicação que fortalece autoridade e percepção de marca.",
      includesLabel: "Inclui",
      includeItems: ["Captação de Conteúdo", "Roteiros e Pautas", "Edição de Vídeos", "Gestão de Redes", "Publicação e Metrificação"],
      excludesLabel: "Não inclui",
      excludeItems: ["Tráfego Pago", "Prospecção Ativa de Empresas"],
      closing: "Do planejamento à presença: uma operação pensada para construir percepção.",
    },
    {
      number: "03",
      title: "Crescimento e Aquisição",
      copy: "Conectamos marketing e oportunidades comerciais para transformar atenção em relacionamento e relacionamento em negócio.",
      includesLabel: "Duas frentes",
      includeFronts: [
        { title: "Gestão de Tráfego Pago", description: "Geração de alcance e leads via Meta Ads." },
        { title: "Prospecção Ativa de Empresas", description: "Aquisição B2B direta." },
      ],
      excludesLabel: "Não inclui",
      excludeItems: ["Produção de conteúdo (Etapas 01 e 02)"],
      closing: "Mais do que gerar alcance, criamos caminhos para gerar oportunidades.",
    },
  ],

  configurator: {
    baseLabel: "Assessoria de Marketing",
    basePrice: 3500,
    matrixPrices: [
      { perfilCount: 1, videos: 4, price: 4270 },
      { perfilCount: 1, videos: 8, price: 5810 },
      { perfilCount: 2, videos: 4, price: 7240 },
      // 2 perfis × 8 vídeos/perfil não é oferecido — ver memória de cálculo no topo do arquivo.
    ],
    perfis: [
      { id: "zona-sul", name: "Pascoal Zona Sul", description: "Estratégia específica para o público da Zona Sul." },
      { id: "zona-norte", name: "Pascoal Zona Norte", description: "Estratégia específica para o público da Zona Norte." },
      { id: "julia", name: "Perfil Expert — Julia Brigidio", description: "Estratégia de posicionamento, autoridade e aquisição.", exclusiveToCompleto: true },
    ],
    growthFronts: [
      { id: "trafego-pago", label: "Gestão de Tráfego Pago", price: 500 },
      { id: "prospeccao-ativa", label: "Prospecção Ativa de Empresas", price: 1500 },
    ],

    // Copy das perguntas — verbatim do pedido.
    questions: {
      scope: {
        question: "Quantos perfis você quer estruturar?",
        options: [
          { label: "1 perfil", value: "1" },
          { label: "2 perfis", value: "2" },
          { label: "3 ou mais", value: "3+" },
        ],
      },
      perfil: {
        question: "Qual perfil você quer estruturar?",
        options: [
          { label: "Pascoal Zona Sul", value: "zona-sul" },
          { label: "Pascoal Zona Norte", value: "zona-norte" },
        ],
      },
      cadence: {
        question: "Com que frequência você quer publicar?",
        options: [
          { label: "1 vídeo por semana", value: "1x" },
          { label: "2 vídeos por semana", value: "2x" },
        ],
      },
      intent: {
        question: "O que você mais precisa agora?",
        options: [
          { label: "Mais visibilidade", value: "visibilidade" },
          { label: "Mais clientes e vendas", value: "vendas" },
          { label: "As duas coisas", value: "ambas" },
          { label: "Nenhum por enquanto", value: "nenhum" },
        ],
      },
      upsell: {
        question: "Sua operação está crescendo para um terceiro perfil?",
        options: [
          { label: "Sim, quero conhecer o Plano Completo", value: "sim" },
          { label: "Não, seguir com a estrutura atual", value: "nao" },
        ],
      },
    },

    completo: {
      headline: "Uma operação. 03 perfis. Uma estratégia integrada.",
      description: "Pascoal Zona Sul, Pascoal Zona Norte e Perfil Expert — Julia Brigidio, cada um com estratégia própria.",
      detailsLine: "12 vídeos/mês · Tráfego para seguidores nos 3 perfis · Leads e Mensagens em 1 perfil · Aquisição de Empresas em 1 perfil.",
      price: 7000,
      mediaInvestment: 1800,
      mediaNote: "Mídia paga (Meta Ads) não inclusa — investimento recomendado de R$ 1.800/mês, feito diretamente na plataforma.",
      chooseLabel: "Quero o Plano Completo",
      backLabel: "Voltar e montar manualmente",
    },

    summary: {
      heading: "Sua estrutura",
      mediaWarning: "Mídia paga (Meta Ads) não inclusa — investimento à parte, feito diretamente na plataforma.",
    },
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
