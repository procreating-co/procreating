import type { ClientConfig } from "@/lib/clients/types";

/**
 * Dra. Pamela — duplicata da arquitetura da Dra. Elenita (`data/elenita/config.ts`), pipeline
 * legado via `lib/clients/registry.ts`.
 *
 * Montado em modo "estrutura" (pedido explícito): as fotos e vídeos ainda NÃO foram subidos, só o
 * esqueleto está pronto pra receber a mídia depois —
 *   - Hero: sem vídeo de fundo ainda (`backgroundVideo: ""`) e sem os números (`stats` omitido).
 *   - carrossel da Home: `features.photos` com `src: null` → cards "Em breve".
 *   - vídeos: `videosSection.production` ativa 3 slots "Em breve" (espelha os 3 vídeos da Elenita),
 *     com `videos.ts` trazendo `socialVideos: []`.
 *   - galeria: pastas criadas em `public/gallery/drapamela/<id>/` (vazias por enquanto).
 *
 * `siteLock` tranca a Home inteira atrás de senha, igual à Elenita.
 */
export const clientConfig: ClientConfig = {
  slug: "drapamela",
  brandName: "Dra. Pamela",
  logo: "/placeholder-logo.svg",

  metadata: {
    title: "Dra. Pamela | Posicionamento Digital",
    description: "Projeto de posicionamento digital e autoridade profissional da Dra. Pamela.",
  },

  theme: {
    accentColor: "#b76e79",
  },

  nav: {
    galleryLabel: "Acessar Galeria",
    prospeccaoCtaLabel: "Prospectar Parceiros",
    // Sem `extraLink` por enquanto (a Elenita tinha "Proposta de Continuidade" própria dela).
  },

  hero: {
    welcomeLines: ["Seja bem vinda,", "Dra. Pâmela Lande."],
    // Vídeo de fundo do Hero ainda não subido — "" esconde o <video> (ver hero-section.tsx).
    backgroundVideo: "",
    paragraph: "Todos materiais captados estão aqui...",
    // `stats` omitido até os números existirem (Hero mostra só o parágrafo).
  },

  features: {
    eyebrow: "Projeto Inicial",
    heading: "Posicionamento Digital.",
    blockNumber: "01.",
    blockTitle: "Fotos Produzidas",
    subtitle: "Captamos a essência do consultório, equipe e a experiência das pacientes com a doutora.",
    galleryButtonLabel: "Acessar Galeria",
    // Placeholders `src: null` → cards "Em breve" até as fotos serem adicionadas.
    photos: [
      { src: null, alt: "Retratos da Dra. Pamela", category: "Retratos Dra. Pamela" },
      { src: null, alt: "Consultório da Dra. Pamela", category: "Consultório" },
      { src: null, alt: "Procedimento na Dra. Pamela", category: "Procedimento" },
      { src: null, alt: "Equipe da Dra. Pamela", category: "Equipe" },
    ],
  },

  videosSection: {
    eyebrow: "Vídeos",
    headingPrefix: "Conteúdos",
    headingSuffix: "para redes sociais.",
    blockNumber: "02.",
    blockTitle: "Vídeos Produzidos.",
    subtitle: "Conteúdos estratégicos para o perfil nas redes sociais.",
    acquisitionEyebrow: "Estratégia de Conteúdo",
    acquisitionHeadingPrefix: "Conteúdos",
    acquisitionHeadingSuffix: "de apresentação.",
    // 3 slots "Em breve" (sem `label` → só a grade). Os vídeos entregues preenchem por `number`.
    production: { count: 3, columns: 3 },
  },

  footer: {
    legalLine: "Desenvolvido para Dra. Pamela.",
  },

  gallery: {
    accessCodes: ["pamela", "admin"],
    lockScreenTitle: "Galeria de Conteúdos",
  },

  prospeccao: null,

  siteLock: {
    accessCodes: ["pamela", "admin"],
    lockScreenTitle: "Acesso Exclusivo",
  },
};
