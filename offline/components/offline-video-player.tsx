"use client";

import { useCallback, useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import { X } from "lucide-react";

export type OfflinePlayerItem = { poster: string; title: string; videoSrc: string };

export type OfflineVideoPlayerHandle = {
  /** Abre o player e começa a tocar, COM áudio. Precisa ser chamado direto de um handler de clique. */
  open: (item: OfflinePlayerItem) => void;
  /** Pré-carrega um vídeo (hover/foco no card) pra que o clique seguinte comece sem espera. */
  warm: (item: OfflinePlayerItem) => void;
};

/**
 * Player em tela cheia da apresentação offline — mesmo visual de `components/landing/video-lightbox.tsx`
 * (overlay preto, botão X, <video> com controles nativos), com duas diferenças pensadas para uso
 * presencial:
 *
 * 1. Um ÚNICO <video> que fica sempre montado. `open()` troca o `src` e chama `video.play()` de
 *    forma síncrona dentro do handler de clique do card — é assim que Chrome e Safari reconhecem o
 *    gesto do usuário e liberam a reprodução com áudio no primeiro clique (sem montar elemento
 *    novo depois de um import dinâmico, que no Safari pode perder o gesto e bloquear o som).
 * 2. Pré-carregamento sob demanda: ao passar o mouse/focar num card, `warm()` aponta o mesmo
 *    <video> para aquele arquivo com `preload="auto"`. Só um vídeo fica em buffer por vez — o que
 *    está prestes a ser clicado — então a memória não cresce com a quantidade de vídeos.
 */
export function OfflineVideoPlayer({ ref }: { ref: Ref<OfflineVideoPlayerHandle> }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [item, setItem] = useState<OfflinePlayerItem | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback((next: OfflinePlayerItem) => {
    const video = videoRef.current;
    if (!video) return null;
    if (video.getAttribute("src") !== next.videoSrc) {
      video.src = next.videoSrc;
      setFailed(false);
    }
    if (next.poster) video.poster = next.poster;
    else video.removeAttribute("poster");
    return video;
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      open(next) {
        const video = load(next);
        if (!video) return;
        if (video.currentTime > 0) video.currentTime = 0;
        video.muted = false;
        setItem(next);
        // Chamado dentro do clique: gesto do usuário válido → reprodução com áudio permitida.
        // Se o navegador ainda assim recusar, o vídeo fica pausado com os controles nativos
        // visíveis e o próximo clique no play funciona — nenhum contorno de política.
        video.play().catch(() => {});
      },
      warm(next) {
        if (item) return; // não troca o vídeo que está sendo exibido
        load(next);
      },
    }),
    [item, load],
  );

  const close = useCallback(() => {
    videoRef.current?.pause();
    setItem(null);
  }, []);

  // Mesmo comportamento de `useModalBehavior` do lightbox online: Esc fecha, trava o scroll do
  // body e devolve o foco pro card ao fechar.
  useEffect(() => {
    if (!item) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previouslyFocused?.focus();
    };
  }, [item, close]);

  return (
    <div
      className={`fixed inset-0 z-[110] items-center justify-center bg-black/95 p-4 backdrop-blur-md ${item ? "flex" : "hidden"}`}
      role="dialog"
      aria-modal="true"
      aria-hidden={!item}
      aria-label={item ? `Vídeo: ${item.title}` : undefined}
      onClick={close}
    >
      <button
        ref={closeButtonRef}
        type="button"
        onClick={close}
        className="absolute right-6 top-6 z-10 flex size-12 items-center justify-center border border-white/20 text-white hover:border-[var(--client-accent)] hover:text-[var(--client-accent)]"
        aria-label="Fechar vídeo"
      >
        <X className="size-5" />
      </button>
      <video
        ref={videoRef}
        controls
        playsInline
        preload="auto"
        onClick={(event) => event.stopPropagation()}
        onError={() => setFailed(true)}
        className="max-h-[90vh] max-w-[92vw] bg-black object-contain"
      />
      {failed && item && (
        <p className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 text-center font-mono text-xs text-white/60">
          Arquivo local deste vídeo não encontrado. Rode <code>npm run sync:offline</code>.
        </p>
      )}
    </div>
  );
}
