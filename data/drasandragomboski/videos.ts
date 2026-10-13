import type { ClientVideos } from "@/lib/clients/types";

/**
 * Sem vídeos entregues ainda — a seção de vídeos roda em modo "em produção"
 * (`config.videosSection.production`), que mostra o contador animado "12 vídeos em produção" e 12
 * slots, independente deste array. Quando os vídeos chegarem: adicione cada um aqui como
 * `VideoItem` (padrão de `data/elenita/videos.ts`) e remova `production` do `config.ts` pra voltar
 * ao layout de vídeos sociais prontos.
 */
export const clientVideos: ClientVideos = {
  socialVideos: [],
};
