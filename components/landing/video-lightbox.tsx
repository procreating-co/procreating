"use client";

import { X } from "lucide-react";
import { useModalBehavior } from "@/hooks/use-modal-behavior";

export type ActiveVideo = { poster: string; title: string; videoSrc: string };

export default function VideoLightbox({ item, onClose }: { item: ActiveVideo; onClose: () => void }) {
  const containerRef = useModalBehavior<HTMLDivElement>({ onClose });

  return (
    <div ref={containerRef} className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-label={`Vídeo: ${item.title}`} onClick={onClose}>
      <button type="button" onClick={onClose} className="absolute right-6 top-6 z-10 flex size-12 items-center justify-center border border-white/20 text-white hover:border-[var(--client-accent)] hover:text-[var(--client-accent)]" aria-label="Fechar vídeo"><X className="size-5" /></button>
      {/* `poster` só quando existe de verdade — evitar `poster=""` (dispara um request vazio
       *  desnecessário); sem card com imagem própria (ex.: `videos-placeholder-section.tsx`), o
       *  primeiro frame do próprio vídeo aparece assim que `autoPlay` começa a carregar. */}
      <video autoPlay controls playsInline poster={item.poster || undefined} onClick={(event) => event.stopPropagation()} className="max-h-[90vh] max-w-[92vw] bg-black object-contain"><source src={item.videoSrc} type="video/mp4" /></video>
    </div>
  );
}
