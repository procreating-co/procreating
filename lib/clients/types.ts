/**
 * Tipos do template multi-cliente. Um cliente novo = uma pasta em `data/<slug>/`
 * exportando `clientConfig: ClientConfig`, `videos: ClientVideos` e
 * `galleryFolderDefs: GalleryFolderDef[]` (veja `data/_template/`).
 *
 * Campos sem `?` são obrigatórios — se um `config.ts` de cliente não preencher algo
 * essencial, o build/type-check falha imediatamente em vez de quebrar em produção.
 */

/** Orientação do vídeo — define qual card/aspect-ratio ele ocupa. */
export type VideoFormat = "horizontal" | "vertical";

/** Um vídeo do projeto (redes sociais ou aquisição), com pôster, fonte e link de download. */
export type VideoItem = {
  /** Identificador estável (chave React, não exibido). */
  id: string;
  /** Numeração exibida ao lado do título (ex.: "01"). */
  number: string;
  /** Título completo (usado como legenda no lightbox). */
  title: string;
  /** Título curto para o cabeçalho do card, quando o completo não cabe. Se ausente, usa `title`. */
  shortTitle?: string;
  format: VideoFormat;
  poster: string;
  /** "contain-blur" evita cortar mal uma foto cujo formato não bate com o card. Padrão: "cover". */
  posterFit?: "cover" | "contain-blur";
  videoSrc: string;
  downloadHref: string;
  ready: boolean;
};

/** Os vídeos do projeto, agrupados nos blocos onde aparecem na Home. */
export type ClientVideos = {
  /** Bloco "Conteúdos para redes sociais" — ordem de exibição = ordem do array. */
  socialVideos: VideoItem[];
  /**
   * Bloco opcional "Conteúdos de aquisição/apresentação" — par lado a lado. Os dois campos
   * andam juntos: presentes os dois, a seção aparece; ausentes os dois (ex.: cliente sem
   * módulo de aquisição ativa), a seção inteira some da Home, sem card vazio.
   */
  acquisitionVideo?: VideoItem;
  presentationVideo?: VideoItem;
};

/** Par número+rótulo usado nas métricas do Hero (ex.: "05" + "vídeos produzidos"). */
export type Metric = { count: number; label: string };

/** Uma foto da Galeria, já resolvida com sua URL pública. */
export type GalleryPhoto = { src: string; alt: string };
/** Uma pasta da Galeria com suas fotos já carregadas do filesystem. */
export type GalleryFolder = { id: string; label: string; photos: GalleryPhoto[] };
/** Metadata de uma pasta da galeria — as fotos em si vêm do filesystem (`public/gallery/<slug>/<id>/`). */
export type GalleryFolderDef = { id: string; label: string };

/** Foto em destaque no carrossel da Home (teaser da Galeria completa). */
export type FeaturedPhoto = { src: string; alt: string; category: string };

/** Configuração do módulo opcional de Prospecção (teaser na Home + página `/prospeccao`). */
export type ProspeccaoConfig = {
  /** Código de acesso da área de prospecção (independente da senha da galeria). */
  accessCode: string;
  /** Data-alvo do desbloqueio do contador, ISO 8601 com timezone (ex.: "2026-07-30T00:00:00-03:00"). */
  unlockAt: string;
  /** Eyebrow do card-teaser na Home (ex.: "Estratégia de Aquisição"). */
  eyebrow: string;
  /** Início do heading do teaser, seguido da palavra que alterna ("<headingPrefix> <typingWords[i]>"). */
  headingPrefix: string;
  /** Palavras que alternam na animação de digitação do heading. */
  typingWords: [string, string, string];
  /** Rótulos dos 3 passos do funil (ícones de lista → disparo → reunião). */
  funnelSteps: [string, string, string];
  /** Título da página /prospeccao já desbloqueada (ex.: "Central de Prospecção"). */
  title: string;
  ctaLabel: string;
  toastText: string;
};

/** Config completa de um cliente — o que `data/<slug>/config.ts` deve exportar como `clientConfig`. */
export type ClientConfig = {
  /** Precisa bater com o nome da pasta em `data/<slug>/` e com a chave em `lib/clients/registry.ts`. */
  slug: string;
  brandName: string;
  /** Logo exibido nas duas lock screens (Galeria e Prospecção). */
  logo: string;
  metadata: {
    title: string;
    description: string;
    /** Imagem de preview ao compartilhar o link (OG/Twitter). Se ausente, usa `logo`. */
    ogImage?: string;
  };
  theme: {
    /** Cor de destaque do cliente (hex). Pascoal usa o dourado atual, "#d4af6a". */
    accentColor: string;
  };
  nav: {
    galleryLabel: string;
    prospeccaoCtaLabel: string;
  };
  hero: {
    /** As duas linhas da animação de boas-vindas digitada. */
    welcomeLines: [string, string];
    backgroundVideo: string;
    paragraph: string;
    stats: {
      videos: Metric;
      photos: Metric;
    };
  };
  features: {
    eyebrow: string;
    heading: string;
    blockNumber: string;
    blockTitle: string;
    subtitle: string;
    galleryButtonLabel: string;
    /** Fotos em destaque no carrossel da Home (teaser da galeria completa). */
    photos: FeaturedPhoto[];
  };
  videosSection: {
    eyebrow: string;
    headingPrefix: string;
    headingSuffix: string;
    blockNumber: string;
    blockTitle: string;
    subtitle: string;
    acquisitionEyebrow: string;
    acquisitionHeadingPrefix: string;
    acquisitionHeadingSuffix: string;
  };
  footer: {
    legalLine: string;
    /** Imagem de fundo do rodapé. Se ausente, usa a imagem decorativa padrão do template. */
    backgroundImage?: string;
  };
  gallery: {
    accessCodes: string[];
    lockScreenTitle: string;
    /** Link para o Google Drive (ou outro storage) com o acervo completo. Se ausente, o convite some da Galeria. */
    driveUrl?: string;
  };
  /** Módulo opcional. `null` desativa a rota `/clients/<slug>/prospeccao`, a seção na Home e o CTA no menu. */
  prospeccao: ProspeccaoConfig | null;
  /**
   * Opcional — quando presente, a Home (`/clients/<slug>/public`) fica atrás de uma tela de
   * senha (mesmo componente/UX de `gallery.lockScreenTitle`/`LockScreen`) antes de mostrar
   * qualquer conteúdo. Ausente (padrão) = Home aberta, só a Galeria pede senha, como sempre foi.
   * Não persiste entre visitas (sem localStorage), mesmo comportamento da Galeria.
   */
  siteLock?: {
    accessCodes: string[];
    lockScreenTitle: string;
  };
};
