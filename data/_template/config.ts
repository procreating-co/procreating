import type { ClientConfig } from "@/lib/clients/types";

/**
 * Template de config para um cliente novo. Copie esta pasta inteira para
 * `data/<slug>/`, preencha os valores abaixo e registre o cliente em
 * `lib/clients/registry.ts`. Passo a passo completo em `data/README.md`.
 *
 * Todo campo sem `?` é obrigatório — se algo essencial ficar sem preencher,
 * o `npx tsc --noEmit` (e o build) falha imediatamente apontando o campo que falta.
 */
export const clientConfig: ClientConfig = {
  /** Precisa bater com o nome desta pasta (`data/<slug>/`) e com a chave que você vai
   *  adicionar em `lib/clients/registry.ts`. Vira o segmento da URL: `/clients/<slug>`. */
  slug: "cliente-exemplo",
  /** Nome exibido no menu, no rodapé e nas lock screens. */
  brandName: "Nome do Cliente",
  /** Logo exibido nas duas lock screens (galeria e prospecção). Coloque o arquivo em `public/images/`. */
  logo: "/images/cliente-exemplo-logo.png",

  metadata: {
    /** `<title>` da aba do navegador e título do preview ao compartilhar o link. */
    title: "Nome do Cliente | Posicionamento e Aquisição",
    /** Descrição usada no preview ao compartilhar o link (WhatsApp, Slack, etc.). */
    description: "Descrição curta do projeto para SEO/compartilhamento.",
    // ogImage: "/images/cliente-exemplo-og.jpg", // opcional — imagem de preview ao compartilhar o link; se ausente, usa `logo`
  },

  theme: {
    /** Cor de destaque do cliente (hex). Vira `var(--client-accent)` em toda a UI. */
    accentColor: "#d4af6a",
  },

  nav: {
    /** Texto do botão da Galeria no menu (desktop e mobile). */
    galleryLabel: "Acessar Galeria",
    /** Texto do botão de Prospecção no menu. Só aparece se `prospeccao` (abaixo) não for `null`. */
    prospeccaoCtaLabel: "Prospectar Parceiros",
  },

  hero: {
    /** As duas linhas da animação de boas-vindas digitada. */
    welcomeLines: ["Sejam bem-vindos,", "Nome do Cliente."],
    /** Vídeo de fundo do Hero. Local (`/videos/...`) ou URL do R2. */
    backgroundVideo: "/videos/hero-background.mp4",
    /** Frase curta ao lado das métricas (some/aparece com uma animação de "respiração"). */
    paragraph: "Frase curta de contexto exibida ao lado das métricas.",
    /** Números animados no rodapé do Hero. */
    stats: {
      videos: { count: 0, label: "vídeos produzidos" },
      photos: { count: 0, label: "fotos editadas" },
    },
  },

  /** Seção com o carrossel de fotos em destaque (teaser da Galeria) na Home. */
  features: {
    /** Texto pequeno acima do heading grande (ex.: "Projeto Inicial"). */
    eyebrow: "Projeto Inicial",
    /** Heading grande da seção. */
    heading: "Posicionamento e Aquisição.",
    /** Numeração do bloco (ex.: "01."), ao lado de `blockTitle`. */
    blockNumber: "01.",
    blockTitle: "Fotos Produzidas",
    subtitle: "Descrição curta do que foi captado.",
    /** Texto do botão que leva pra Galeria completa. */
    galleryButtonLabel: "Acessar Galeria",
    /** Fotos em destaque no carrossel da Home (teaser da galeria completa). */
    photos: [
      { src: "/images/gallery/exemplo-01.jpg", alt: "Descrição da foto", category: "Categoria 1" },
      { src: "/images/gallery/exemplo-02.jpg", alt: "Descrição da foto", category: "Categoria 2" },
    ],
  },

  /** Seção com os vídeos (redes sociais + aquisição) na Home. */
  videosSection: {
    eyebrow: "Vídeos",
    /** Início do heading, seguido de `headingSuffix` numa segunda linha mais apagada. */
    headingPrefix: "Conteúdos",
    headingSuffix: "para redes sociais.",
    blockNumber: "02.",
    blockTitle: "Vídeos Produzidos.",
    subtitle: "Descrição curta dos vídeos de redes sociais.",
    /** Mesma estrutura acima, mas para o bloco "Conteúdos para aquisição" logo abaixo. */
    acquisitionEyebrow: "Estratégia de Aquisição",
    acquisitionHeadingPrefix: "Conteúdos",
    acquisitionHeadingSuffix: "para aquisição.",
  },

  footer: {
    /** Duas frases legais separadas por `\n` (ex.: razão social e CNPJ). */
    legalLine: "Desenvolvido para Razão Social Ltda.\nCNPJ 00.000.000/0001-00.",
    // backgroundImage: "/images/footer-earth-gradient.png", // opcional — se ausente, usa a imagem padrão do template
  },

  gallery: {
    /** Códigos que desbloqueiam a Galeria — case-insensitive, aceita mais de um (ex.: um pro
     *  cliente, um "mestre" pra equipe interna). Nunca fica salvo entre visitas (sem
     *  localStorage) — pede o código de novo a cada carregamento da página. */
    accessCodes: ["cliente-exemplo"],
    /** Título mostrado na lock screen antes de desbloquear. */
    lockScreenTitle: "Galeria de Conteúdos",
    // driveUrl: "https://drive.google.com/...", // opcional — se ausente, o convite "Acessar Galeria Completa" some
  },

  /**
   * Módulo opcional. `null` desativa a rota `/clients/<slug>/prospeccao`, a seção
   * "Estratégia de Aquisição" na Home e o CTA "Prospectar Parceiros" no menu.
   */
  prospeccao: null,
  // prospeccao: {
  //   accessCode: "admin",
  //   unlockAt: "2026-12-31T00:00:00-03:00", // ISO 8601 com timezone
  //   eyebrow: "Estratégia de Aquisição",
  //   headingPrefix: "Prospecção de",
  //   typingWords: ["Palavra 1", "Palavra 2", "Palavra 3"],
  //   funnelSteps: ["Passo 1", "Passo 2", "Passo 3"],
  //   title: "Central de Prospecção",
  //   ctaLabel: "Acessar Central de Prospecção.",
  //   toastText: "Falta pouco!",
  // },
};
