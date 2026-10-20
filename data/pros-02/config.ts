import type { ClientConfig } from "@/lib/clients/types";

/**
 * Página-vitrine `/pros/02` — duplicata do template da Dra. Elenita
 * (`data/elenita/config.ts`, "posicionamento-pro"), mas como apresentação da própria
 * Procreating Co. (não entrega de cliente). Montada por `app/pros/[slug]/page.tsx`.
 *
 * Diferenças pedidas em relação à Elenita:
 *  - marca "Procreating Co." (era "Dra. Elenita Luzardo");
 *  - sem botões "Acessar Galeria" (`nav.showGallery = false`) e sem "Proposta de Continuidade"
 *    (sem `nav.extraLink`);
 *  - Hero: "Sua clínica merece ser vista, / da forma certa.";
 *  - sem o parágrafo "Todos materiais captados..." nem os números (sem `hero.stats`);
 *  - sem trava de senha (`siteLock` omitido) — é um link de apresentação, aberto como `/pros/01`.
 * O resto (bloco de fotos, vídeos, footer) é igual ao da Elenita.
 */
export const clientConfig: ClientConfig = {
  slug: "pros-02",
  brandName: "Procreating Co.",
  logo: "/placeholder-logo.svg",

  metadata: {
    title: "Procreating Co. | Posicionamento Digital",
    description: "Apresentação de posicionamento digital e autoridade profissional pela Procreating Co.",
  },

  theme: {
    accentColor: "#b76e79",
  },

  nav: {
    galleryLabel: "Acessar Galeria",
    prospeccaoCtaLabel: "Prospectar Parceiros",
    // Botões "Acessar Galeria" (menu + bloco de fotos) escondidos; sem "Proposta de Continuidade".
    showGallery: false,
  },

  hero: {
    welcomeLines: ["Sua clínica merece ser vista,", "da forma certa."],
    backgroundVideo: "/videos/elenita-hero-background.mp4",
    // Parágrafo + números removidos (pedido): string vazia some com o bloco inteiro.
    paragraph: "",
  },

  features: {
    eyebrow: "O que fazemos",
    heading: "Criamos Posicionamento Digital.",
    blockNumber: "01.",
    blockTitle: "Ensaio Fotográfico",
    subtitle: "Captamos a essência do consultório, equipe e a experiência das pacientes com a doutora.",
    galleryButtonLabel: "Acessar Galeria",
    // Fotos sortidas da galeria da Elenita (sem consultório), `category: ""` pra NÃO mostrar
    // nenhum rótulo interno sobre a foto. Troque livremente por outras de
    // `public/gallery/elenita/{retratos-elenita,procedimento,retratos-elenita-alexandre}/`.
    photos: [
      { src: "/gallery/elenita/retratos-elenita/retratos-elenita-01.jpg", alt: "Ensaio fotográfico", category: "" },
      { src: "/gallery/elenita/procedimento/procedimento-03.jpg", alt: "Ensaio fotográfico", category: "" },
      { src: "/gallery/elenita/retratos-elenita-alexandre/retratos-elenita-alexandre-02.jpg", alt: "Ensaio fotográfico", category: "" },
      { src: "/gallery/elenita/retratos-elenita/retratos-elenita-08.jpg", alt: "Ensaio fotográfico", category: "" },
      { src: "/gallery/elenita/procedimento/procedimento-11.jpg", alt: "Ensaio fotográfico", category: "" },
      { src: "/gallery/elenita/retratos-elenita-alexandre/retratos-elenita-alexandre-06.jpg", alt: "Ensaio fotográfico", category: "" },
      { src: "/gallery/elenita/retratos-elenita/retratos-elenita-15.jpg", alt: "Ensaio fotográfico", category: "" },
      { src: "/gallery/elenita/procedimento/procedimento-07.jpg", alt: "Ensaio fotográfico", category: "" },
    ],
  },

  videosSection: {
    eyebrow: "Vídeos",
    headingPrefix: "Conteúdos",
    headingSuffix: "para redes sociais.",
    blockNumber: "02.",
    blockTitle: "Produção de Conteúdo",
    subtitle: "Conteúdos estratégicos para o perfil nas redes sociais.",
    acquisitionEyebrow: "Estratégia de Conteúdo",
    acquisitionHeadingPrefix: "Conteúdos",
    acquisitionHeadingSuffix: "de apresentação.",
    // Esconde número/título/download dos vídeos — só o vídeo clicável.
    hideVideoMeta: true,
    // Grade 3×3 (estilo Elenita, sem contador pois não tem `label`): posições 01-03 = Elenita,
    // 04-06 = Sandra, 07-09 = "Em breve" (3 espaços reservados). Ver `data/pros-02/videos.ts`.
    production: { count: 9, columns: 3 },
  },

  footer: {
    // Sem a razão social/CNPJ da Elenita (seria incorreto numa página da Procreating). O crédito
    // "Planejado e Executado por Procreating Co. © 2026" já é fixo no rodapé.
    legalLine: "",
  },

  gallery: {
    accessCodes: ["procreating", "admin"],
    lockScreenTitle: "Galeria de Conteúdos",
  },

  prospeccao: null,

  // Sem `siteLock`: página aberta, sem senha (é um link de apresentação).
};
