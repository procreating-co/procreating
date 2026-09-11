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
 * Cada posição é `string | null`: `null` = arquivo ainda não subido pra aquele slot → a seção
 * mostra o placeholder "Em produção" só ali, sem depender de nenhuma flag global.
 */

const R2_BASE = "https://pub-42560a6ade7e4e5994d209ebe8c409c9.r2.dev";

/** V01, V02. */
export const setembroVerticalVideos: (string | null)[] = [
  r2Url(R2_BASE, "V1Conselho do pascoal - Zona Sul.mp4"),
  r2Url(R2_BASE, "V2Erro de diagnóstico - Zona Sul.mp4"),
];

/** H01–H10 — H02 a H05 ainda não foram enviados (permanecem "Em produção"). */
export const setembroHorizontalVideos: (string | null)[] = [
  r2Url(R2_BASE, "H1 vídeo “vlog um dia na Pascoal” -_1.mp4"),
  null,
  null,
  null,
  null,
  r2Url(R2_BASE, "H6 vídeo situação mais engraçada que aconteceu na Pascoal-_1.mp4"),
  r2Url(R2_BASE, "H7  vídeo de um mecânico explicando sobre o que ele tá fazendo parte 1 -_1 - cópia.mp4"),
  // H08 — vídeo NOVO do mecânico (~79MB), substitui o antigo "Dia a dia" que estava neste slot.
  r2Url(R2_BASE, "H8  vídeo de um mecânico explicando sobre o que ele tá fazendo parte 1 -_1.mp4"),
  r2Url(R2_BASE, "H9 Frases do Pascoal 1 - Zona Sul.mp4"),
  r2Url(R2_BASE, "H10Dia a dia na pascoal - Zona Sul.mp4"),
];
