import { r2Url } from "@/lib/r2";
import { clientVideos as pascoalLegacyVideos } from "@/data/pascoal/videos";

/**
 * Conteúdo da página de prospecção `/pros/01` — nicho "oficinas, mecânicas e negócios técnicos"
 * (pedido explícito), usando a Pascoal Bombas como case. Página nova, bespoke (não usa o template
 * "Presentation" genérico de `lib/clients/presentation-types.ts` — aquele vocabulário de seções
 * foi pensado pra site de posicionamento tipo "sobre/projeto/galeria"; o que foi pedido aqui é
 * uma experiência de scroll cinematográfica, com VSL, case antes/direção/depois e grade editorial
 * — perto o bastante de zero sobreposição real pra justificar forçar dentro daquele contrato).
 *
 * TUDO que aparece como mídia é real — vídeos hospedados nos MESMOS buckets R2 já em produção
 * (`data/pascoal/videos.ts`, o legado; `data/pascoal/setembro-videos.ts`, os 12 novos) e fotos já
 * commitadas em `public/gallery/pascoal/**`. Nenhum thumbnail/número/depoimento é inventado.
 */

const SETEMBRO_R2_BASE = "https://pub-42560a6ade7e4e5994d209ebe8c409c9.r2.dev";

export type ProsMediaItem =
  | { kind: "video"; src: string; orientation: "vertical" | "horizontal" }
  | { kind: "image"; src: string; alt: string; orientation: "vertical" | "horizontal" | "square" };

const video = (filename: string, orientation: "vertical" | "horizontal", base: string = SETEMBRO_R2_BASE): ProsMediaItem => ({
  kind: "video",
  src: r2Url(base, filename),
  orientation,
});

/** Pros itens de `data/pascoal/videos.ts` — aquele arquivo já exporta a URL pronta (encoding
 *  manual histórico, ver nota lá), reusa direto em vez de tentar reconstruir o nome do arquivo. */
const videoFromUrl = (src: string, orientation: "vertical" | "horizontal"): ProsMediaItem => ({ kind: "video", src, orientation });

const image = (src: string, alt: string, orientation: "vertical" | "horizontal" | "square" = "square"): ProsMediaItem => ({ kind: "image", src, alt, orientation });

export const oficinasProsContent = {
  slug: "01",
  metaTitle: "Procreating — presença digital para oficinas e negócios técnicos",
  metaDescription: "Como a Procreating transformou a Pascoal Bombas em referência digital do próprio mercado.",

  // TODO: confirmar o WhatsApp/Instagram reais da Procreating antes de enviar a página pra
  // qualquer prospect — estes são placeholders óbvios (nunca dígitos de uma pessoa real),
  // propositalmente inválidos até serem substituídos.
  whatsapp: {
    phoneDigits: "5500000000000",
    message: "Olá! Vi a apresentação da Procreating e quero conversar sobre o meu negócio.",
  },
  instagramUrl: "https://instagram.com/procreating.co",

  hero: {
    videoSrc: "/videos/hero-background.mp4",
    headline: "Seu negócio merece ser visto como referência.",
  },

  vsl: {
    label: "Vídeo em produção",
  },

  whatWeDid: {
    heading: "O que fizemos.",
    items: [
      video("H1 vídeo “vlog um dia na Pascoal” -_1.mp4", "horizontal"),
      image("/gallery/pascoal/equipe/equipe-01.jpg", "Equipe da Pascoal Bombas", "vertical"),
      video("V1Conselho do pascoal - Zona Sul.mp4", "vertical"),
      image("/gallery/pascoal/zona-sul/zona-sul-02.jpg", "Unidade Pascoal Zona Sul", "horizontal"),
      video("H9 Frases do Pascoal 1 - Zona Sul.mp4", "horizontal"),
      image("/gallery/pascoal/individuais/individuais-03.jpg", "Retrato individual da equipe", "vertical"),
    ] satisfies ProsMediaItem[],
  },

  problem: {
    headline: "Empresas excelentes nem sempre parecem excelentes na internet.",
    paragraph:
      "Muitas empresas desse mercado possuem anos de experiência, estrutura, conhecimento técnico, clientes fiéis e profissionais excelentes.\n\nMas quando alguém procura pela empresa na internet, encontra uma comunicação que não representa tudo isso.",
  },

  firstImpression: {
    headline: "Antes de entrar em contato, o cliente já formou uma impressão.",
    steps: ["Google", "Instagram", "Site", "WhatsApp", "Contato"],
    note: "Hoje, a percepção da sua empresa também é construída antes do primeiro contato.",
  },

  notAboutPosting: {
    lines: [
      "Não é sobre postar mais.",
      "É sobre mostrar melhor.",
      "Mostrar quem você é.",
      "Mostrar o que você faz.",
      "Mostrar por que você é bom.",
      "E fazer isso parecer tão profissional quanto o seu negócio realmente é.",
    ],
  },

  caseStudy: {
    title: "Pascoal Bombas",
    subtitle: "Transformando um negócio técnico em uma presença digital à altura da sua experiência.",
    before: "Décadas de experiência prática, duas unidades, clientes fiéis — e uma presença digital que não contava nada disso.",
    direction: "Direção de imagem real (nada de produção artificial), conteúdo do dia a dia da oficina e uma apresentação pensada pra quem já é referência no próprio mercado, só precisava parecer.",
    afterItems: [
      videoFromUrl(pascoalLegacyVideos.presentationVideo!.videoSrc, "horizontal"),
      video("H6 vídeo situação mais engraçada que aconteceu na Pascoal-_1.mp4", "horizontal"),
      video("V2Erro de diagnóstico - Zona Sul.mp4", "vertical"),
      image("/gallery/pascoal/zona-norte/zona-norte-01.jpg", "Unidade Pascoal Zona Norte", "horizontal"),
    ] satisfies ProsMediaItem[],
  },

  whatCanBeShown: {
    headline: "Seu negócio tem muito mais para mostrar.",
    categories: [
      { label: "Estrutura", item: image("/gallery/pascoal/zona-sul/zona-sul-04.jpg", "Estrutura da Pascoal Bombas", "horizontal") },
      { label: "Equipamentos", item: image("/gallery/pascoal/zona-norte/zona-norte-03.jpg", "Equipamentos da Pascoal Bombas", "square") },
      { label: "Profissionais", item: image("/gallery/pascoal/retratos-pascoal/retratos-pascoal-04.jpg", "Retrato de profissional da Pascoal Bombas", "vertical") },
      { label: "Bastidores", item: video("H8  vídeo de um mecânico explicando sobre o que ele tá fazendo parte 1 -_1.mp4", "horizontal") },
    ],
  },

  industries: {
    headline: "Se você trabalha com...",
    items: ["Oficinas", "Bombas", "Motores", "Hidráulica", "Manutenção", "Equipamentos", "Indústria", "Assistência técnica", "Serviços especializados"],
  },

  about: {
    headline: "A gente transforma competência real em autoridade reconhecida.",
    paragraph: "Pegamos aquilo que sua empresa já tem de melhor e transformamos em uma presença digital capaz de comunicar esse valor.",
    pillars: ["Direção", "Posicionamento", "Conteúdo", "Audiovisual", "Estratégia digital"],
  },

  howItWorks: {
    steps: [
      { number: "01", title: "Entender", description: "Entendemos o negócio, a operação, os diferenciais e o mercado." },
      { number: "02", title: "Direcionar", description: "Definimos como a empresa precisa ser percebida." },
      { number: "03", title: "Produzir", description: "Transformamos conhecimento, estrutura e operação em conteúdo." },
      { number: "04", title: "Distribuir", description: "Colocamos esse conteúdo para trabalhar nos canais certos." },
      { number: "05", title: "Construir autoridade", description: "A presença digital começa a refletir o tamanho real do negócio." },
    ],
  },

  finalCta: {
    headline: "Seu negócio já tem valor.\nVamos fazer o mercado perceber.",
    ctaLabel: "Quero conversar",
  },
};

export type ProsContent = typeof oficinasProsContent;
