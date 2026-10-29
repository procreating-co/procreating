"use client";

import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import type { GalleryVideo } from "@/lib/gallery";
import { useModalBehavior } from "@/hooks/use-modal-behavior";

/**
 * Visualização de um vídeo da Galeria em tela cheia. Serve o arquivo ORIGINAL do R2 direto no
 * <video controls> (sem recompressão → qualidade máxima); o download passa pelo proxy
 * `/api/download` (o atributo `download` sozinho não funciona cross-origin). Observação: arquivos
 * `.MOV` (QuickTime) tocam inline no Safari/iOS e em navegadores com suporte ao codec; onde o
 * navegador não reproduz o container, o botão Baixar continua funcionando sempre.
 */
export function VideoLightbox({
  video,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onClose,
}: {
  video: GalleryVideo;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}) {
  const containerRef = useModalBehavior<HTMLDivElement>({
    onClose,
    onPrev: hasPrev ? onPrev : undefined,
    onNext: hasNext ? onNext : undefined,
  });

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Visualização do vídeo"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-6 top-6 z-10 flex size-12 items-center justify-center border border-white/20 text-white transition-colors hover:border-[var(--client-accent)] hover:text-[var(--client-accent)]"
        aria-label="Fechar"
      >
        <X className="size-5" />
      </button>

      <a
        href={`/api/download?src=${encodeURIComponent(video.src)}`}
        download
        onClick={(event) => event.stopPropagation()}
        className="absolute left-6 top-6 z-10 flex h-12 items-center gap-2 border border-white/20 px-5 text-sm text-white transition-colors hover:border-[var(--client-accent)] hover:text-[var(--client-accent)]"
      >
        <Download className="size-4" /> Baixar
      </a>

      {hasPrev && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onPrev();
          }}
          className="absolute left-4 top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center border border-white/20 text-white transition-colors hover:border-[var(--client-accent)] hover:text-[var(--client-accent)] sm:left-6"
          aria-label="Vídeo anterior"
        >
          <ChevronLeft className="size-5" />
        </button>
      )}
      {hasNext && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onNext();
          }}
          className="absolute right-4 top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center border border-white/20 text-white transition-colors hover:border-[var(--client-accent)] hover:text-[var(--client-accent)] sm:right-6"
          aria-label="Próximo vídeo"
        >
          <ChevronRight className="size-5" />
        </button>
      )}

      <div className="flex max-h-[88vh] max-w-[92vw] items-center justify-center" onClick={(event) => event.stopPropagation()}>
        <video
          key={video.src}
          src={video.src}
          controls
          autoPlay
          playsInline
          preload="metadata"
          className="max-h-[86vh] max-w-[92vw] bg-black"
        />
      </div>
    </div>
  );
}
