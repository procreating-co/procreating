import { getClientConfig, getClientVideos, type ClientConfig, type ClientVideos, type VideoItem } from "@/lib/clients";
import manifest from "../generated/manifest.json";

/**
 * Dados da apresentação offline: exatamente o mesmo `config`/`videos` que a versão online usa
 * (`data/pascoal/*` via `@/lib/clients`), com TODA URL de vídeo trocada pelo arquivo local baixado
 * por `npm run sync:offline` (mapa em `offline/generated/manifest.json`).
 *
 * Sem fallback remoto de propósito: se um vídeo não tiver cópia local, o build falha aqui com uma
 * mensagem clara — em vez de a apresentação tentar buscar no R2 no meio da reunião.
 */

export const OFFLINE_CLIENT_SLUG = "pascoal";

type ManifestEntry = { originalSrc: string; localUrl: string };

const localBySource = new Map((manifest.videos as ManifestEntry[]).map((entry) => [entry.originalSrc, entry.localUrl]));

function localize(src: string): string {
  const local = localBySource.get(src);
  if (!local) throw new Error(`[offline] Vídeo sem cópia local: ${src}\nRode "npm run sync:offline" para baixá-lo.`);
  return local;
}

function localizeVideo(video: VideoItem): VideoItem {
  return { ...video, videoSrc: localize(video.videoSrc), downloadHref: localize(video.downloadHref) };
}

export async function getOfflinePresentation(): Promise<{ config: ClientConfig; videos: ClientVideos }> {
  const [config, videos] = await Promise.all([getClientConfig(OFFLINE_CLIENT_SLUG), getClientVideos(OFFLINE_CLIENT_SLUG)]);
  if (!config || !videos) throw new Error(`[offline] Cliente "${OFFLINE_CLIENT_SLUG}" não encontrado em data/.`);

  return {
    config: {
      ...config,
      hero: { ...config.hero, backgroundVideo: localize(config.hero.backgroundVideo) },
      features: { ...config.features, backgroundVideo: config.features.backgroundVideo ? localize(config.features.backgroundVideo) : undefined },
    },
    videos: {
      ...videos,
      socialVideos: videos.socialVideos.map(localizeVideo),
      acquisitionVideo: videos.acquisitionVideo ? localizeVideo(videos.acquisitionVideo) : videos.acquisitionVideo,
      presentationVideo: videos.presentationVideo ? localizeVideo(videos.presentationVideo) : videos.presentationVideo,
    },
  };
}
