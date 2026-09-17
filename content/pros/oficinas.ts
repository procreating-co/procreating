import { clientVideos as pascoalLegacyVideos } from "@/data/pascoal/videos";
import { setembroHorizontalVideos } from "@/data/pascoal/setembro-videos";
import { clientConfig as pascoalConfig } from "@/data/pascoal/config";

/**
 * Conteúdo da página de prospecção `/pros/01` — nicho "oficinas, mecânicas e negócios técnicos".
 * Pedido explícito desta rodada: sem header, Hero centralizado/menor/subido, seção de vídeos
 * dividida em "institucionais" + um ensaio fotográfico (carrossel infinito, sem link pra galeria)
 * + "sociais", e um footer com CTA de WhatsApp real.
 *
 * `metaTitle`/`metaDescription`/`ogImage` são metadata de `<head>`, nunca aparecem na página.
 *
 * Vídeos: mesmos do bucket R2 legado da Pascoal (`data/pascoal/videos.ts`) + 1 do bucket
 * setembro/26 (`data/pascoal/setembro-videos.ts`). Fotos: as MESMAS 5 fotos reais já usadas no
 * site do cliente (`data/pascoal/config.ts`, `features.photos`) — nenhum arquivo novo, só
 * reaproveitando o que já está em `public/images/gallery/`.
 */

export type ProsVideo = { src: string };
export type ProsPhoto = { src: string; alt: string; category: string };

export const oficinasProsContent = {
  slug: "01",
  metaTitle: "Procreating Co. | Estratégia, Audiovisual e Autoridade Digital",
  metaDescription: "Vídeos produzidos pela Procreating Co.",
  ogImage: "/images/pascoal-equipe-oficina.jpg",

  // Número real de WhatsApp, passado explicitamente pelo usuário nesta rodada — substitui o
  // placeholder ("5500000000000") flagado nos relatórios de rodadas anteriores. A mensagem
  // também veio pronta: é o texto pré-preenchido no link E a base do rótulo do botão do footer.
  whatsapp: {
    phoneDigits: "5551982205917",
    message: "Quero aplicar isso ao meu negócio.",
  },

  hero: {
    videoSrc: "/videos/hero-background.mp4",
    welcomeLines: ["Seu negócio merece ser visto", "da forma certa."] as [string, string],
  },

  // Bloco "institucional" — pedido explícito: "O que fazemos?" + "Construímos autoridades / com
  // estratégias de posicionamento." + o MESMO vídeo que já estava na primeira posição (Vídeo de
  // Apresentação), só com o rótulo "01. Vídeos Institucionais" adicionado acima dele.
  whatWeDo: {
    eyebrow: "O que fazemos?",
    heading: ["Construímos autoridades", "com estratégias de posicionamento."] as [string, string],
    videoLabel: ["01.", "Vídeos Institucionais"] as [string, string],
    video: { src: pascoalLegacyVideos.presentationVideo!.videoSrc },
  },

  // Ensaio fotográfico — pedido explícito: mesmo carrossel de fotos do site do cliente
  // (`/clients/pascoal/public/past`), mas sem link pra galeria (nem clicável, nem botão "Acessar
  // Galeria") e passando sozinho a cada 2s em vez de arrastar manualmente. Reaproveita as 5 fotos
  // reais já cadastradas em `data/pascoal/config.ts` — nada inventado.
  photos: {
    heading: "Ensaio Fotográfico",
    items: pascoalConfig.features.photos.map((photo) => ({ src: photo.src, alt: photo.alt, category: photo.category })) satisfies ProsPhoto[],
  },

  // Vídeos "sociais" — pedido explícito: eyebrow "Vídeos" + heading "Conteúdos / para redes
  // sociais." (réplica exata do `videosSection` do cliente) + horizontal, par vertical, horizontal
  // (os 4 vídeos restantes que já estavam na página, só sem o de Apresentação, que virou o
  // institucional acima).
  socialVideos: {
    eyebrow: "Vídeos",
    heading: ["Conteúdos", "para redes sociais."] as [string, string],
    topHorizontal: { src: pascoalLegacyVideos.socialVideos[2].videoSrc }, // Entrevista com Pascoal
    verticalPair: [
      { src: pascoalLegacyVideos.socialVideos[0].videoSrc }, // Processo
      { src: pascoalLegacyVideos.socialVideos[1].videoSrc }, // Serviços
    ] as [ProsVideo, ProsVideo],
    bottomHorizontal: { src: setembroHorizontalVideos[9]!.src }, // vídeo 12 (H10)
  },

  // Sem marca/atribuição embaixo (pedido explícito desta rodada: excluir "Procreating Co." e
  // "Planejado e Executado por...").
  footer: {
    headline: "Quer entender como isso pode ser aplicado ao seu negócio?",
    ctaLabel: "Quero aplicar isso ao meu negócio",
  },
};

export type ProsContent = typeof oficinasProsContent;
