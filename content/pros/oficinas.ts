import { clientVideos as pascoalLegacyVideos } from "@/data/pascoal/videos";
import { setembroHorizontalVideos } from "@/data/pascoal/setembro-videos";

/**
 * Conteúdo da página de prospecção `/pros/01` — nicho "oficinas, mecânicas e negócios técnicos".
 * Pedido explícito (reconstrução completa desta rodada — "não quero aproveitar nada do que está
 * aqui"): replicar a estrutura/estilo de `/clients/pascoal/public` (Header, Hero com welcome
 * digitado, seção "Vídeos", Footer — as MESMAS 4 seções de `PascoalSetembroTemplate`), com copy
 * própria da Procreating Co. em vez da Pascoal. Os componentes compartilhados usados pelo site do
 * cliente (`components/landing/navigation.tsx`, `hero-section.tsx`, `videos-placeholder-section.tsx`,
 * `footer-section.tsx`) não foram tocados — `components/pros/**` tem sua própria versão de cada
 * seção, só clonando o estilo visual, pra não arriscar nada no site real do cliente.
 *
 * `metaTitle`/`metaDescription`/`ogImage` são metadata de `<head>`, nunca aparecem na página.
 *
 * Toda mídia é real — mesmos vídeos já em produção nos buckets R2 da Pascoal (legado,
 * `data/pascoal/videos.ts`; setembro/26, `data/pascoal/setembro-videos.ts`).
 */

export type ProsVideo = { src: string };

export type ProsVideoRow =
  | { kind: "horizontal"; video: ProsVideo }
  | { kind: "vertical-pair"; videos: [ProsVideo, ProsVideo] };

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

  header: {
    // Pedido explícito: "Pascoal Bombas > Procreating Co." + excluir o botão "Acessar o Projeto
    // Inicial" (não existe equivalente aqui — não há "projeto anterior" pra essa página apontar).
    brandName: "Procreating Co.",
  },

  hero: {
    videoSrc: "/videos/hero-background.mp4",
    // Pedido explícito: "Sejam bem-vindos, Pascoal e equipe." -> "Seu negócio merece ser visto /
    // da forma certa." — mesmas duas linhas digitadas ao carregar (réplica do welcome do cliente).
    // Sem parágrafo nem estatística numérica embaixo (pedido explícito: excluir "Os novos
    // materiais estão aqui..." e qualquer número, incluindo "12 vídeos produzidos").
    welcomeLines: ["Seu negócio merece ser visto", "da forma certa."] as [string, string],
  },

  videos: {
    // Pedido explícito: "Vídeos" -> "Construímos Autoridades"; "Conteúdos para redes / da Julia e
    // Pascoal" -> "Você faz um trabalho de excelência. / Nós fazemos o mundo conhecer isso."
    eyebrow: "Construímos Autoridades",
    heading: ["Você faz um trabalho de excelência.", "Nós fazemos o mundo conhecer isso."] as [string, string],
    // Ordem exata pedida, sem numeração nenhuma nos cards (pedido explícito: "tudo envolvendo
    // números você pode excluir, isso de vídeo 01, 02, 03...").
    rows: [
      { kind: "horizontal", video: { src: pascoalLegacyVideos.presentationVideo!.videoSrc } }, // 02. Vídeo de Apresentação
      { kind: "horizontal", video: { src: pascoalLegacyVideos.socialVideos[2].videoSrc } }, // 03. Entrevista com Pascoal
      {
        kind: "vertical-pair",
        videos: [
          { src: pascoalLegacyVideos.socialVideos[0].videoSrc }, // 01. Processo
          { src: pascoalLegacyVideos.socialVideos[1].videoSrc }, // 02. Serviços
        ],
      },
      { kind: "horizontal", video: { src: setembroHorizontalVideos[9]!.src } }, // vídeo 12 (H10)
    ] satisfies ProsVideoRow[],
  },

  footer: {
    brandName: "Procreating Co.",
  },
};

export type ProsContent = typeof oficinasProsContent;
