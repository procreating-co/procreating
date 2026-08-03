/**
 * ProjectConfig / Blocks — o formato genérico de conteúdo pra projetos novos (Supabase-backed).
 * **Independente de `ClientConfig`** (`lib/clients/types.ts`), que continua intocado e
 * alimenta só a Pascoal e qualquer cliente no caminho de arquivo — este tipo nunca é lido por
 * `app/clients/[client]/**` nem por nenhum componente de `components/landing|gallery|prospeccao/**`.
 *
 * Em vez de campos nomeados fixos (`hero`, `gallery`, `prospeccao`...), um projeto é uma lista
 * ORDENADA de blocos tipados — a ordem da lista é a ordem de exibição. Um `Template`
 * (`lib/supabase/types/database.ts`) declara quais `BlockType` usa; instanciar um projeto a
 * partir dele copia esses blocos com dados reais pra `ProjectConfig.blocks`.
 *
 * Quando (e se) isso um dia precisar renderizar de verdade, um "montador" novo interpreta essa
 * lista e invoca o componente certo por `type` — os componentes existentes
 * (`HeroSection`, `FeaturesSection` etc.) não precisam mudar, só ganham um adaptador que
 * traduz `HeroBlockData` pro shape de props que eles já esperam.
 */

export type BlockType =
  | "hero"
  | "gallery"
  | "videos"
  | "cta"
  | "downloads"
  | "infrastructure"
  | "timeline"
  | "faq"
  | "team"
  | "testimonials"
  | "prospection"
  | "traffic"
  | "custom";

export type HeroBlockData = {
  welcomeLines: [string, string];
  backgroundVideo: string;
  paragraph: string;
};

export type GalleryBlockData = {
  lockScreenTitle: string;
  accessCodes: string[];
  driveUrl?: string;
};

export type VideosBlockData = {
  eyebrow: string;
  headingPrefix: string;
  headingSuffix: string;
};

export type CtaBlockData = {
  label: string;
  href: string;
};

export type DownloadsBlockData = {
  items: { label: string; assetId: string }[];
};

export type InfrastructureBlockData = {
  eyebrow: string;
  headingPrefix: string;
  typingWords: [string, string, string];
};

export type TimelineBlockData = {
  steps: { label: string; date?: string }[];
};

export type FaqBlockData = {
  items: { question: string; answer: string }[];
};

export type TeamBlockData = {
  members: { name: string; role: string; photoAssetId?: string }[];
};

export type TestimonialsBlockData = {
  items: { quote: string; author: string }[];
};

export type ProspectionBlockData = {
  accessCode: string;
  unlockAt: string;
  funnelSteps: [string, string, string];
};

export type TrafficBlockData = {
  pixelId?: string;
  utmDefaults?: Record<string, string>;
};

export type CustomBlockData = {
  html?: string;
  notes?: string;
};

/** Mapa type → shape do `data` — usado só a nível de tipo, pra `Block<T>` inferir o `data` certo. */
export type BlockDataByType = {
  hero: HeroBlockData;
  gallery: GalleryBlockData;
  videos: VideosBlockData;
  cta: CtaBlockData;
  downloads: DownloadsBlockData;
  infrastructure: InfrastructureBlockData;
  timeline: TimelineBlockData;
  faq: FaqBlockData;
  team: TeamBlockData;
  testimonials: TestimonialsBlockData;
  prospection: ProspectionBlockData;
  traffic: TrafficBlockData;
  custom: CustomBlockData;
};

export type Block = {
  [K in BlockType]: { type: K; data: BlockDataByType[K] };
}[BlockType];

export type ProjectConfig = {
  metadata: { title: string; description: string; ogImage?: string };
  theme: { accentColor: string };
  /** Ordem da lista = ordem de exibição. */
  blocks: Block[];
};
