import { r2Url } from "@/lib/r2";
import { clientVideos as pascoalLegacyVideos } from "@/data/pascoal/videos";

/**
 * Conteúdo da página de prospecção `/pros/01` — nicho "oficinas, mecânicas e negócios técnicos",
 * usando a Pascoal Bombas como case. Redesenho completo (pedido explícito) — 11 seções (Header,
 * Hero, Problema, Solução, Case, Como Funciona, Diferencial, FAQ, CTA final, Footer; "Provas de
 * Autoridade" foi omitida de propósito — não há depoimento/métrica real e autorizada pra preencher
 * essa seção sem inventar, e o pedido original diz explicitamente pra não preencher com
 * informação fictícia nesse caso).
 *
 * O vídeo "Vídeo de Apresentação (Reunião Horizontal)" saiu do Hero (pedido explícito) e virou o
 * vídeo do bloco de scroll/drag reveal (era "VSL") — cabe melhor ali (é literalmente um vídeo de
 * apresentação/reunião) do que como loop de fundo do Hero, que volta a usar o vídeo original
 * (`/videos/hero-background.mp4`, "a versão anterior", pedido explícito).
 *
 * Toda mídia é real — vídeos hospedados nos MESMOS buckets R2 já em produção
 * (`data/pascoal/videos.ts`, legado; `data/pascoal/setembro-videos.ts`, os 12 novos) e fotos já
 * commitadas em `public/gallery/pascoal/**`.
 */

const SETEMBRO_R2_BASE = "https://pub-42560a6ade7e4e5994d209ebe8c409c9.r2.dev";

export type ProsGalleryVideo = {
  src: string;
  orientation: "vertical" | "horizontal";
  /** Colunas ocupadas num grid de 6 no desktop — curadoria manual (verticais precisam ter
   *  presença, não parecer miniatura ao lado dos horizontais). */
  span: number;
};

const setembro = (filename: string, orientation: ProsGalleryVideo["orientation"], span: number): ProsGalleryVideo => ({
  src: r2Url(SETEMBRO_R2_BASE, filename),
  orientation,
  span,
});

const legacy = (src: string, orientation: ProsGalleryVideo["orientation"], span: number): ProsGalleryVideo => ({ src, orientation, span });

export const oficinasProsContent = {
  slug: "01",
  metaTitle: "Procreating | Estratégia, Conteúdo e Autoridade Digital",
  metaDescription: "Transformamos competência real em autoridade digital por meio de estratégia, audiovisual e conteúdo para negócios que querem ser percebidos como referência.",
  ogImage: "/images/pascoal-equipe-oficina.jpg",

  // O número abaixo veio assim do pedido do usuário — é IDÊNTICO ao placeholder que eu mesmo
  // inventei numa rodada anterior (mesmos dígitos, mesma mensagem), o que sugere que ainda não é
  // o WhatsApp real da Procreating. Mantido exatamente como pedido; ver aviso no relatório final.
  whatsapp: {
    phoneDigits: "5500000000000",
    message: "Olá, gostaria de conversar sobre o posicionamento e a comunicação digital da minha empresa.",
  },
  instagramUrl: "https://instagram.com/procreating.co",

  header: {
    brandName: "Procreating",
    nav: [
      { label: "O problema", href: "#problema" },
      { label: "A solução", href: "#solucao" },
      { label: "Case", href: "#case" },
      { label: "Processo", href: "#processo" },
      { label: "Contato", href: "#contato" },
    ],
    ctaLabel: "Falar com a Procreating",
  },

  hero: {
    // Pedido explícito: voltou a ser o vídeo original (loop de fundo simples, sem o efeito de
    // scroll/drag reveal, que se mudou pro bloco 2 / VSL).
    videoSrc: "/videos/hero-background.mp4",
    headline: "Seu negócio técnico merece ser percebido como referência.",
    subheadline: "Transformamos competência real em autoridade digital por meio de estratégia, conteúdo e audiovisual, valorizando o que torna sua empresa diferente.",
    primaryCta: "Quero transformar meu negócio",
    secondaryCta: "Conhecer nosso trabalho",
    secondaryCtaHref: "#case",
  },

  vsl: {
    // Bloco 2 (nomenclatura da estrutura anterior) — pedido explícito: é aqui que o efeito de
    // scroll/drag reveal vive agora, com o vídeo que saiu do Hero.
    videoSrc: pascoalLegacyVideos.presentationVideo!.videoSrc,
  },

  problem: {
    eyebrow: "O problema",
    headline: "Sua empresa pode ser excelente. Mas o mercado consegue perceber isso?",
    paragraph:
      "Muitas empresas técnicas têm anos de experiência, estrutura, conhecimento e clientes fiéis — mas uma comunicação digital que não representa nada disso.\n\nO resultado é parecer menor do que realmente é, depender de preço pra competir e perder a diferenciação que a operação já construiu.",
  },

  solution: {
    eyebrow: "A solução",
    headline: "Nós traduzimos valor real em autoridade reconhecida.",
    paragraph: "A partir da estratégia, do audiovisual e do conteúdo, construímos uma presença digital capaz de comunicar a qualidade que já existe dentro do seu negócio.",
    pillars: [
      { number: "01", title: "Estratégia e posicionamento", description: "Definição de direção, diferenciais, mensagem e a percepção que a empresa precisa comunicar." },
      { number: "02", title: "Audiovisual estratégico", description: "Vídeos e imagens que demonstram a estrutura, a competência, os processos e a qualidade do negócio." },
      { number: "03", title: "Conteúdo e comunicação", description: "Uma presença digital consistente, relevante e alinhada aos objetivos reais da empresa." },
      { number: "04", title: "Distribuição e conversão", description: "Estratégia pra ampliar o alcance, atrair o público certo e transformar atenção em conversa comercial." },
    ],
  },

  caseStudy: {
    eyebrow: "Case",
    title: "Pascoal Bombas",
    intro: "Um negócio com competência real merece uma comunicação à altura.",
    challenge: "Décadas de experiência prática, duas unidades, clientes fiéis — e uma presença digital que não contava nada disso.",
    strategy:
      "Direção de imagem real (nada de produção artificial), conteúdo do dia a dia da oficina e uma apresentação pensada pra quem já é referência no próprio mercado, só precisava parecer.",
    executionLabel: "A execução",
    galleryLabel: "Pascoal Bombas",
    galleryItems: [
      legacy(pascoalLegacyVideos.socialVideos[2].videoSrc, "horizontal", 4), // Entrevista com Pascoal
      setembro("V1Conselho do pascoal - Zona Sul.mp4", "vertical", 2),
      setembro("H6 vídeo situação mais engraçada que aconteceu na Pascoal-_1.mp4", "horizontal", 3),
      legacy(pascoalLegacyVideos.acquisitionVideo!.videoSrc, "vertical", 3),
      setembro("H9 Frases do Pascoal 1 - Zona Sul.mp4", "horizontal", 4),
      setembro("V2Erro de diagnóstico - Zona Sul.mp4", "vertical", 2),
    ] satisfies ProsGalleryVideo[],
    resultNote:
      "O foco desta primeira fase foi a transformação visual e estratégica — direção real, conteúdo real, apresentação à altura da operação. Métricas e depoimentos entram aqui assim que houver resultado comprovado e autorizado pra compartilhar.",
  },

  howItWorks: {
    eyebrow: "Como funciona",
    headline: "Um processo simples e transparente.",
    steps: [
      { number: "01", title: "Diagnóstico", description: "Entendemos o negócio, o mercado, os diferenciais e os objetivos." },
      { number: "02", title: "Estratégia", description: "Definimos como a empresa deve ser percebida e quais mensagens precisam ser comunicadas." },
      { number: "03", title: "Produção", description: "Desenvolvemos vídeos, imagens e conteúdos que traduzem a competência do negócio." },
      { number: "04", title: "Presença digital", description: "Organizamos a comunicação e os canais pra gerar consistência e autoridade." },
      { number: "05", title: "Distribuição e evolução", description: "Acompanhamos a publicação e a distribuição de acordo com a estratégia definida." },
    ],
  },

  differentiator: {
    eyebrow: "Diferencial",
    headline: "Não produzimos conteúdo por produzir.",
    paragraph:
      "Cada produção precisa cumprir um papel na percepção, no posicionamento e nos objetivos do negócio. Nosso trabalho conecta estratégia, direção criativa e execução audiovisual pra comunicar o valor que já existe.",
    points: ["Estratégia antes da produção", "Direção criativa", "Conteúdo orientado ao negócio", "Consistência de posicionamento"],
  },

  faq: {
    eyebrow: "Perguntas frequentes",
    items: [
      {
        question: "Para quais negócios a Procreating trabalha?",
        answer: "Negócios técnicos e tradicionais — oficinas, bombas, motores, hidráulica, manutenção, indústria, assistência técnica — que já têm valor real e precisam de uma comunicação à altura.",
      },
      {
        question: "A Procreating faz apenas vídeos?",
        answer: "Não. O audiovisual é parte de uma estratégia mais ampla de posicionamento, conteúdo e comunicação — não um serviço isolado.",
      },
      {
        question: "Como funciona o início do projeto?",
        answer: "Uma conversa inicial pra entender o negócio, seguida de diagnóstico, alinhamento e definição do escopo antes de qualquer produção.",
      },
      {
        question: "O projeto é personalizado?",
        answer: "Sim — a estratégia e as entregas são definidas conforme o negócio, o mercado e os objetivos de cada cliente.",
      },
    ],
  },

  finalCta: {
    headline: "Seu negócio já tem valor.\nVamos fazer o mercado perceber.",
    paragraph: "Converse com a Procreating e descubra como transformar a comunicação da sua empresa em uma presença digital mais forte, estratégica e reconhecida.",
    ctaLabel: "Quero conversar com a Procreating",
  },
};

export type ProsContent = typeof oficinasProsContent;
