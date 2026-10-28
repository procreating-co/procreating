import type { ClientVideos } from "@/lib/clients/types";

/**
 * Vídeos da Dra. Pamela — ainda NÃO subidos (pedido: só a estrutura por enquanto). Por isso
 * `socialVideos` está vazio: a Home renderiza 3 slots "Em breve" via `videosSection.production`
 * (ver `config.ts`). Quando os vídeos chegarem, suba no R2 em `clients/drapamela/videos/<arquivo>.mp4`
 * e adicione cada item aqui com o `number` correspondente ao slot que deve ocupar.
 */
export const clientVideos: ClientVideos = {
  socialVideos: [],
};
