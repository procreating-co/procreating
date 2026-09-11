import { r2Url } from "@/lib/r2";

/**
 * Vídeos da seção "Vídeos" da Home da Pascoal (setembro/26) — 02 verticais + 10 horizontais.
 *
 * Mesmo processo dos vídeos que já existem no projeto (ver `docs/r2.md` e `data/pascoal/videos.ts`):
 * o arquivo .mp4 mora num bucket público do Cloudflare R2, aqui só ficam as URLs. Bucket NOVO
 * (`pascoalsetembro`, domínio público confirmado pelo usuário — diferente do bucket legado da
 * Pascoal em `data/pascoal/videos.ts`), arquivos soltos na raiz, com o nome original de upload
 * (sem renomear — cada `r2Url()` abaixo usa o nome exato do objeto no bucket).
 *
 * Cada posição é `SetembroVideoSlot | null`: `null` = arquivo ainda não subido pra aquele slot →
 * a seção mostra o placeholder "Em produção" só ali, sem depender de nenhuma flag global.
 */

export type SetembroVideoSlot = {
  src: string;
  /** Segundo do vídeo usado como capa (thumbnail) no card, em vez do frame 0 (pedido explícito —
   *  "atualmente está pegando o primeiro frame e está feio"). Ausente = frame 0, como sempre.
   *  Aplicado via Media Fragment (`#t=<segundos>`) só na `<video>` do card; a reprodução real
   *  (lightbox) sempre começa do zero. */
  posterSeconds?: number;
};

const R2_BASE = "https://pub-42560a6ade7e4e5994d209ebe8c409c9.r2.dev";

/** V01, V02. */
export const setembroVerticalVideos: (SetembroVideoSlot | null)[] = [
  { src: r2Url(R2_BASE, "V1Conselho do pascoal - Zona Sul.mp4") },
  { src: r2Url(R2_BASE, "V2Erro de diagnóstico - Zona Sul.mp4") },
];

/** H01–H10 — todos confirmados no bucket (`curl -I`, 200 + Content-Length batendo com o arquivo
 *  original, ver commit). Cartões 05 (H03) e 08 (H06) usam capa em 2s — pedido explícito, o
 *  frame 0 desses dois ficava feio. */
export const setembroHorizontalVideos: (SetembroVideoSlot | null)[] = [
  { src: r2Url(R2_BASE, "H1 vídeo “vlog um dia na Pascoal” -_1.mp4") },
  { src: r2Url(R2_BASE, "H2 vídeo “quem eu sou” da Júlia -.mp4") },
  { src: r2Url(R2_BASE, "H3 vídeo sobre a discriminação- conselho para mulheres no mundo automotivo_1.mp4"), posterSeconds: 2 },
  { src: r2Url(R2_BASE, "H4 vídeo sobre como ela tomou a gerência da Pascoal -_1 (1).mp4") },
  { src: r2Url(R2_BASE, "H5 - É bico ou bomba.mp4") },
  { src: r2Url(R2_BASE, "H6 vídeo situação mais engraçada que aconteceu na Pascoal-_1.mp4"), posterSeconds: 2 },
  { src: r2Url(R2_BASE, "H7  vídeo de um mecânico explicando sobre o que ele tá fazendo parte 1 -_1 - cópia.mp4") },
  // H08 — vídeo NOVO do mecânico (~79MB), substitui o antigo "Dia a dia" que estava neste slot.
  { src: r2Url(R2_BASE, "H8  vídeo de um mecânico explicando sobre o que ele tá fazendo parte 1 -_1.mp4") },
  { src: r2Url(R2_BASE, "H9 Frases do Pascoal 1 - Zona Sul.mp4") },
  { src: r2Url(R2_BASE, "H10Dia a dia na pascoal - Zona Sul.mp4") },
];
