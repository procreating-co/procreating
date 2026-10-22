"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Loader2, X } from "lucide-react";
import { optimizedGallerySrc, type GalleryPhoto } from "@/lib/gallery";
import { useModalBehavior } from "@/hooks/use-modal-behavior";

export function PhotoLightbox({
  photo,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onClose,
}: {
  photo: GalleryPhoto;
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

  // A tela cheia mostra a FOTO ORIGINAL do R2 (sem recompressão → altíssima qualidade). Como o
  // arquivo é grande, uma versão leve e otimizada aparece na hora como prévia e a original entra
  // por cima quando termina de carregar. `loaded` reseta a cada troca de foto (prev/próxima).
  const [loaded, setLoaded] = useState(false);
  useEffect(() => setLoaded(false), [photo.src]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Visualização da foto"
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
        href={`/api/download?src=${encodeURIComponent(photo.src)}`}
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
          aria-label="Foto anterior"
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
          aria-label="Próxima foto"
        >
          <ChevronRight className="size-5" />
        </button>
      )}

      <div className="relative flex items-center justify-center" onClick={(event) => event.stopPropagation()}>
        {/* Prévia leve (otimizada, q75 — permitido pelo Next 16) enquanto a original não chega. */}
        <img
          src={optimizedGallerySrc(photo.src, 1200)}
          alt=""
          aria-hidden="true"
          className={`max-h-[90vh] max-w-[92vw] object-contain transition-opacity duration-300 ${loaded ? "opacity-0" : "opacity-100"}`}
        />
        {/* Foto original em altíssima qualidade, por cima, fade-in ao carregar. */}
        <img
          key={photo.src}
          src={photo.src}
          alt={photo.alt}
          onLoad={() => setLoaded(true)}
          className={`absolute inset-0 m-auto max-h-[90vh] max-w-[92vw] object-contain transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
        {!loaded && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <Loader2 className="size-8 animate-spin text-white/70" />
          </span>
        )}
      </div>
    </div>
  );
}
