import type { ClientConfig } from "@/lib/clients/types";
import { galleryPhotos } from "./gallery";

/**
 * Dra. Pâmela — duplicata da arquitetura da Dra. Elenita (`data/elenita/config.ts`), pipeline
 * legado via `lib/clients/registry.ts`.
 *
 * Mídia servida do bucket R2 da Pâmela (`data/drapamela/gallery.ts` + `videos.ts`):
 *   - Hero: sem vídeo de fundo (pedido) → fundo atmosférico animado das propostas (`atmosphere`).
 *   - carrossel da Home: 6 fotos destaque reais (`galleryPhotos`).
 *   - Galeria (`/galeria`): todas as fotos (grade plana) + acervo de vídeos, com download.
 *   - vídeos sociais produzidos ainda pendentes → 3 slots "Em breve" na Home (`production`).
 *
 * `siteLock` tranca a Home inteira atrás de senha, igual à Elenita.
 */
export const clientConfig: ClientConfig = {
  slug: "drapamela",
  brandName: "Dra. Pâmela",
  logo: "/placeholder-logo.svg",

  metadata: {
    title: "Dra. Pâmela | Posicionamento Digital",
    description: "Projeto de posicionamento digital e autoridade profissional da Dra. Pâmela.",
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
    // Sem vídeo de fundo (pedido): usa o fundo atmosférico animado das propostas, na cor do cliente.
    backgroundVideo: "",
    atmosphere: true,
    paragraph: "Todos materiais captados estão aqui...",
    stats: {
      videos: { count: 46, label: "vídeos brutos" },
      // Número de marketing escolhido pela cliente — independente da quantidade exibida na galeria.
      photos: { count: 394, label: "fotos editadas" },
    },
  },

  features: {
    // "Projeto Inicial" / "Posicionamento Digital." removidos a pedido — vazios somem da seção
    // (FeaturesSection renderiza eyebrow/heading só quando têm texto).
    eyebrow: "",
    heading: "",
    blockNumber: "01.",
    blockTitle: "Fotos Produzidas",
    subtitle: "Captamos a essência do consultório, equipe e a experiência das pacientes com a doutora.",
    galleryButtonLabel: "Acessar Galeria",
    // Carrossel-teaser da Home: as 6 fotos destaque da galeria (R2), sem rótulo por cima
    // (`category: ""`). Fonte única em `gallery.ts` (`galleryPhotos`).
    photos: galleryPhotos.map((photo) => ({ ...photo, category: "" })),
  },

  // Bloco de vídeos da Home ("Vídeos Produzidos") removido a pedido — os vídeos ficam só na
  // Galeria (`videos.ts` → `galleryVideos`). Sem `videosSection`, a seção some da Home.

  footer: {
    legalLine: "Desenvolvido para Dra. Pâmela.",
  },

  gallery: {
    accessCodes: ["pamela", "admin"],
    lockScreenTitle: "Galeria de Conteúdos",
    // Botão de baixar em cada foto da grade (além do botão no lightbox).
    allowDownload: true,
  },

  prospeccao: null,

  siteLock: {
    accessCodes: ["pamela", "admin"],
    lockScreenTitle: "Acesso Exclusivo",
  },
};
