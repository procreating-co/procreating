import { clientVideos as pascoalLegacyVideos } from "@/data/pascoal/videos";

/**
 * Conteúdo da página de prospecção `/pros/01` — nicho "oficinas, mecânicas e negócios técnicos".
 * Pedido explícito (rodada "foco no mobile"): sem header (nada de marca fixa no topo — mais
 * espaço útil pro Hero em telas pequenas), Hero com o texto centralizado e subido pra caber antes
 * da primeira dobra no celular, e a seção de vídeos virou um fluxo alternado texto→vídeo→texto→
 * vídeo (2 vídeos só, não mais os 4 da rodada anterior) — pensado pra rolagem em coluna única,
 * que é exatamente como uma tela de celular já lê a página de qualquer forma.
 *
 * `metaTitle`/`metaDescription`/`ogImage` são metadata de `<head>`, nunca aparecem na página.
 *
 * Toda mídia é real — mesmos vídeos já em produção no bucket R2 legado da Pascoal
 * (`data/pascoal/videos.ts`).
 */

export type ProsVideo = { src: string };

export const oficinasProsContent = {
  slug: "01",
  metaTitle: "Procreating Co. | Estratégia, Audiovisual e Autoridade Digital",
  metaDescription: "Vídeos produzidos pela Procreating Co.",
  ogImage: "/images/pascoal-equipe-oficina.jpg",

  // O número abaixo veio assim do pedido do usuário — é IDÊNTICO ao placeholder que eu mesmo
  // inventei numa rodada anterior (mesmos dígitos, mesma mensagem), o que sugere que ainda não é
  // o WhatsApp real da Procreating. Mantido exatamente como pedido; ver aviso no relatório final.
  whatsapp: {
    phoneDigits: "5500000000000",
    message: "Olá, gostaria de conversar sobre o posicionamento e a comunicação digital da minha empresa.",
  },

  hero: {
    videoSrc: "/videos/hero-background.mp4",
    // Pedido explícito: "Sua oficina merece / ser vista da forma certa." — mesma mecânica de
    // digitação ao carregar, texto centralizado no mobile e subido (ver `pros-hero.tsx`) pra
    // aparecer antes da primeira dobra.
    welcomeLines: ["Sua oficina merece", "ser vista da forma certa."] as [string, string],
  },

  videos: {
    // Pedido explícito: fluxo alternado — eyebrow "O que fazemos" + heading, primeiro vídeo,
    // legenda, segundo vídeo. Sem numeração (mantém a regra da rodada anterior).
    eyebrow: "O que fazemos",
    heading: "Transformamos negócios em referência.",
    video1: { src: pascoalLegacyVideos.presentationVideo!.videoSrc }, // Vídeo de Apresentação
    caption: "Você faz um negócio de excelência, nós fazemos o mundo ver isso.",
    video2: { src: pascoalLegacyVideos.socialVideos[2].videoSrc }, // Entrevista com Pascoal
  } satisfies { eyebrow: string; heading: string; video1: ProsVideo; caption: string; video2: ProsVideo },

  footer: {
    brandName: "Procreating Co.",
  },
};

export type ProsContent = typeof oficinasProsContent;
