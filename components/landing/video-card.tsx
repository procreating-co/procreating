"use client";

import Image from "next/image";
import { Download, Play } from "lucide-react";
import type { VideoItem } from "@/lib/clients/types";

/** Renderiza a capa do vídeo. `contain-blur` evita cortar mal uma foto cujo formato
 *  não bate com o card (ex.: foto horizontal usada provisoriamente num card vertical). */
export function VideoPoster({ item }: { item: VideoItem }) {
  if (item.posterFit === "contain-blur") {
    return (
      <>
        <Image src={item.poster} alt="" aria-hidden="true" fill sizes="(min-width: 1024px) 340px, 90vw" className="scale-110 object-cover opacity-40 blur-2xl" />
        <Image src={item.poster} alt="" fill sizes="(min-width: 1024px) 340px, 90vw" className="object-contain transition-transform duration-700 group-hover:scale-105" />
      </>
    );
  }
  // Sem capa definida: usa o primeiro frame do próprio vídeo em vez de um placeholder genérico.
  // `#t=0.1` força o navegador a pintar o frame em 0,1s — sem isso o mobile (iOS Safari) mostra
  // um quadro preto em vez da capa.
  if (!item.poster) {
    return <video src={`${item.videoSrc}#t=0.1`} muted playsInline preload="metadata" tabIndex={-1} aria-hidden="true" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />;
  }
  return <Image src={item.poster} alt="" fill sizes="(min-width: 1024px) 340px, 90vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />;
}

/**
 * Card de vídeo padrão do site: número, linha divisória, título e botão de download (ou selo de
 * status) juntos numa única linha acima da mídia. Vídeos verticais mantêm moldura completa
 * (acabamento premium); vídeos horizontais não têm borda/padding lateral, para aproveitar melhor
 * o espaço.
 */
export function VideoCard({ video, titleOverride, badgeOverride, bare, stretch, onOpen, className }: { video: VideoItem; titleOverride?: string; badgeOverride?: string; bare?: boolean; stretch?: boolean; onOpen: () => void; className?: string }) {
  const isHorizontal = video.format === "horizontal" || bare;
  const aspectClass = video.format === "horizontal" ? "aspect-video" : "aspect-[9/16]";
  const mediaClass = stretch ? `${aspectClass} lg:aspect-auto lg:min-h-0 lg:flex-1` : aspectClass;
  const title = titleOverride ?? video.title;

  return (
    <article className={`group ${stretch ? "flex flex-col lg:h-full" : ""} ${isHorizontal ? "py-4 lg:py-5" : "bg-black p-5 lg:p-7"} ${className ?? ""}`}>
      <div className="mb-4 flex shrink-0 items-center gap-4 lg:mb-5">
        <span className="shrink-0 font-display text-3xl text-[var(--client-accent)]">{video.number}.</span>
        <h3 className="min-w-0 shrink text-balance text-left font-display text-xl leading-snug lg:text-2xl">{title}</h3>
        <span className="h-px min-w-6 flex-1 bg-white/15" />
        {video.ready ? (
          <a href={`/api/download?src=${encodeURIComponent(video.downloadHref)}`} download className="flex size-10 shrink-0 items-center justify-center border border-white/15 text-white/55 transition-colors hover:border-[var(--client-accent)] hover:text-[var(--client-accent)]" aria-label={`Baixar vídeo ${video.number}`}><Download className="size-4" /></a>
        ) : (
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-white/35">{badgeOverride ?? "Em produção"}</span>
        )}
      </div>
      {video.ready ? (
        <button type="button" onClick={onOpen} className={`relative block ${mediaClass} w-full overflow-hidden text-left`} aria-label={`Abrir vídeo em tela cheia: ${title}`}>
          <VideoPoster item={video} />
          <span className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/35" />
          <span className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-black/35 text-white backdrop-blur-sm transition-all group-hover:scale-110 group-hover:border-[var(--client-accent)] group-hover:text-[var(--client-accent)]"><Play className="ml-1 size-5 fill-current" /></span>
        </button>
      ) : (
        <div className={`relative block ${mediaClass} w-full overflow-hidden opacity-60`} aria-hidden="true">
          <VideoPoster item={video} />
          <span className="absolute inset-0 bg-black/50" />
        </div>
      )}
    </article>
  );
}
