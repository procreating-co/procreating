import { r2Url } from "@/lib/r2";

/**
 * Vídeos da seção "Vídeos" da Home da Pascoal (setembro/26) — 02 verticais + 10 horizontais.
 *
 * Mesmo processo dos vídeos que já existem no projeto (ver `docs/r2.md` e `data/pascoal/videos.ts`):
 * o arquivo .mp4 mora no bucket público do Cloudflare R2, e aqui só ficam as URLs. Estes são
 * arquivos NOVOS, então seguem a convenção documentada pra tudo novo — `clients/pascoal/videos/…`
 * — em vez da raiz do bucket onde estão os 5 vídeos legados da Pascoal (aqueles não foram
 * movidos pra não quebrar URLs em produção; ver a nota em `data/pascoal/videos.ts`).
 *
 * `READY`: enquanto `false`, a seção mostra o placeholder de sempre ("Em produção"). Vira `true`
 * só depois que os 12 arquivos estiverem confirmados no bucket (cada URL abaixo respondendo 200)
 * — mesmo papel do campo `ready` de cada `VideoItem` em `data/pascoal/videos.ts`.
 */

const R2_BASE = "https://pub-925b76414c3f40558af2fc11a5d46fb4.r2.dev/clients/pascoal/videos/setembro-26";

export const SETEMBRO_VIDEOS_READY = false;

/** Ordem = ordem dos cards. Verticais V01→V02, horizontais H01→H10. */
export const setembroVerticalVideos: string[] = [
  r2Url(R2_BASE, "V01.mp4"),
  r2Url(R2_BASE, "V02.mp4"),
];

export const setembroHorizontalVideos: string[] = [
  r2Url(R2_BASE, "H01.mp4"),
  r2Url(R2_BASE, "H02.mp4"),
  r2Url(R2_BASE, "H03.mp4"),
  r2Url(R2_BASE, "H04.mp4"),
  r2Url(R2_BASE, "H05.mp4"),
  r2Url(R2_BASE, "H06.mp4"),
  r2Url(R2_BASE, "H07.mp4"),
  r2Url(R2_BASE, "H08.mp4"),
  r2Url(R2_BASE, "H09.mp4"),
  r2Url(R2_BASE, "H10.mp4"),
];
