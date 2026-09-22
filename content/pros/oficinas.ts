import { clientVideos as pascoalLegacyVideos } from "@/data/pascoal/videos";
import { setembroHorizontalVideos } from "@/data/pascoal/setembro-videos";

/**
 * Conteúdo da página de prospecção `/pros/01` — nicho "oficinas, mecânicas e negócios técnicos".
 * Sem header, Hero centralizado, seção de vídeos institucionais (3 vídeos horizontais) + seção de
 * vídeos sociais (só o par vertical), sem footer CTA.
 *
 * `metaTitle`/`metaDescription`/`ogImage` são metadata de `<head>`, nunca aparecem na página.
 *
 * Vídeos: mesmos do bucket R2 legado da Pascoal (`data/pascoal/videos.ts`) + 1 do bucket
 * setembro/26 (`data/pascoal/setembro-videos.ts`).
 */

export type ProsVideo = { src: string };

export const oficinasProsContent = {
  slug: "01",
  metaTitle: "Procreating Co. | Estratégia, Audiovisual e Autoridade Digital",
  metaDescription: "Vídeos produzidos pela Procreating Co.",
  ogImage: "/images/pascoal-equipe-oficina.jpg",

  // Número real de WhatsApp — usado pelo CTA flutuante (`ProsMobileStickyCta`), único contato
  // direto da página (sem CTA no footer).
  whatsapp: {
    phoneDigits: "5551982205917",
    message: "Quero aplicar isso ao meu negócio.",
  },

  hero: {
    videoSrc: "/videos/hero-background.mp4",
    welcomeLines: ["Seu negócio merece ser visto", "da forma certa."] as [string, string],
  },

  // Bloco "institucional" — "O que fazemos?" + "Construímos autoridades / com estratégias de
  // posicionamento." + rótulo "01. Vídeos Institucionais" + 3 vídeos horizontais empilhados: o
  // vídeo de Apresentação (original), seguido do 1º vídeo e do último horizontal que estavam em
  // "Conteúdos para redes sociais" (movidos pra cá).
  whatWeDo: {
    eyebrow: "O que fazemos?",
    heading: ["Construímos autoridades", "com estratégias de posicionamento."] as [string, string],
    videoLabel: ["01.", "Vídeos Institucionais"] as [string, string],
    videos: [
      { src: pascoalLegacyVideos.presentationVideo!.videoSrc },
      { src: pascoalLegacyVideos.socialVideos[2].videoSrc }, // Entrevista com Pascoal (1º vídeo de "Conteúdos para redes sociais")
      { src: setembroHorizontalVideos[9]!.src }, // vídeo 12/H10 (último horizontal de "Conteúdos para redes sociais")
    ] as ProsVideo[],
  },

  // Vídeos "sociais" — eyebrow "Vídeos" + heading "Conteúdos / para redes sociais." (réplica exata
  // do `videosSection` do cliente), agora só com o par vertical (os 2 horizontais foram pro bloco
  // institucional acima).
  socialVideos: {
    eyebrow: "Vídeos",
    heading: ["Conteúdos", "para redes sociais."] as [string, string],
    verticalPair: [
      { src: pascoalLegacyVideos.socialVideos[0].videoSrc }, // Processo
      { src: pascoalLegacyVideos.socialVideos[1].videoSrc }, // Serviços
    ] as [ProsVideo, ProsVideo],
  },

  // Sem CTA/botão no footer — só a headline encerra a página.
  footer: {
    headline: "Quer entender como isso pode ser aplicado ao seu negócio?",
  },
};

export type ProsContent = typeof oficinasProsContent;
