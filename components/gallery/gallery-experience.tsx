"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { ArrowRight, ChevronLeft, ChevronRight, Download, Home, Play } from "lucide-react";
import { LockScreen } from "@/components/gallery/lock-screen";
import { AnimatedRevealText } from "@/components/shared/animated-reveal-text";
import { optimizedGallerySrc, type GalleryFolder, type GalleryPhoto, type GalleryVideo } from "@/lib/gallery";

const PhotoLightbox = dynamic(() => import("@/components/gallery/photo-lightbox").then((mod) => mod.PhotoLightbox));
const VideoLightbox = dynamic(() => import("@/components/gallery/video-lightbox").then((mod) => mod.VideoLightbox));

const COVER_PHOTO_LIMIT = 6;

function shuffle<T>(items: T[]) {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const HINT_TEXT = "Acessar Galeria Completa";
const HINT_TYPE_MS = 45;
const HINT_NOTIFY_DELAY_MS = 10000;
const HINT_NOTIFY_DURATION_MS = 900;

/** Digita "Acessar Galeria Completa" e, 10s depois de terminar, pulsa uma vez para lembrar que está ali. */
function GalleryHintLink({ driveUrl }: { driveUrl: string }) {
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);
  const [notify, setNotify] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const schedule = (fn: () => void, delay: number) => {
      timeouts.push(setTimeout(() => !cancelled && fn(), delay));
    };

    let i = 0;
    const type = () => {
      if (cancelled) return;
      setTyped(HINT_TEXT.slice(0, i));
      if (i >= HINT_TEXT.length) {
        setDone(true);
        schedule(() => {
          setNotify(true);
          schedule(() => setNotify(false), HINT_NOTIFY_DURATION_MS);
        }, HINT_NOTIFY_DELAY_MS);
        return;
      }
      i++;
      schedule(type, HINT_TYPE_MS);
    };
    type();

    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <a
      href={driveUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 whitespace-nowrap font-mono text-xs uppercase tracking-wide text-muted-foreground transition-colors hover:text-[var(--client-accent)] sm:text-sm ${
        notify ? "animate-[hint-pulse_900ms_ease-in-out]" : ""
      }`}
    >
      <span>
        {typed}
        {!done && <span className="animate-pulse">|</span>}
      </span>
      <ArrowRight className="size-4 shrink-0 sm:size-5" />
    </a>
  );
}

function FolderCover({ folder }: { folder: GalleryFolder }) {
  const [coverPhotos] = useState(() => shuffle(folder.photos).slice(0, COVER_PHOTO_LIMIT));
  const [rotationMs] = useState(() => 3000 + Math.random() * 3000);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (coverPhotos.length <= 1) return;
    const interval = setInterval(() => setActiveIndex((current) => (current + 1) % coverPhotos.length), rotationMs);
    return () => clearInterval(interval);
  }, [coverPhotos.length, rotationMs]);

  if (coverPhotos.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <span className="font-mono text-xs uppercase tracking-wide text-white/30">Em breve</span>
      </div>
    );
  }

  return (
    <>
      {coverPhotos.map((photo, photoIndex) => (
        <Image
          key={photo.src}
          src={photo.src}
          alt={folder.label}
          fill
          sizes="(min-width: 1024px) 31vw, (min-width: 640px) 55vw, 78vw"
          loading="lazy"
          className={`object-cover transition-all duration-700 group-hover:scale-105 ${
            photoIndex === activeIndex ? "translate-x-0 opacity-80 group-hover:opacity-100" : "translate-x-6 opacity-0"
          }`}
        />
      ))}
    </>
  );
}

/**
 * Carrossel de pastas com navegação circular: as setas avançam/voltam com wraparound (da
 * última pasta a seta "próxima" volta pra primeira, e vice-versa), e o índice ativo acompanha
 * o scroll real (swipe ou setas) via a pasta mais próxima do início visível.
 */
function FolderCarousel({ folders, onSelect }: { folders: GalleryFolder[]; onSelect: (id: string) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const activeIndexRef = useRef(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      let nearestIndex = 0;
      let nearestDistance = Infinity;
      slideRefs.current.forEach((slide, i) => {
        if (!slide) return;
        const distance = Math.abs(slide.offsetLeft - el.scrollLeft);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = i;
        }
      });
      activeIndexRef.current = nearestIndex;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = (index: number) => {
    const wrapped = (index + folders.length) % folders.length;
    activeIndexRef.current = wrapped;
    slideRefs.current[wrapped]?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  };

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onWheel={(event) => {
          if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
            event.currentTarget.scrollBy({ left: event.deltaY, behavior: "smooth" });
          }
        }}
        className="flex w-full cursor-grab touch-pan-y snap-x snap-mandatory gap-5 overflow-x-scroll scroll-smooth pb-2 active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {folders.map((folder, index) => (
          <button
            key={folder.id}
            ref={(el) => { slideRefs.current[index] = el; }}
            type="button"
            onClick={() => onSelect(folder.id)}
            className="group relative aspect-[4/5] w-[78vw] max-w-[320px] shrink-0 snap-start overflow-hidden border border-white/15 bg-background text-left transition-colors hover:border-[var(--client-accent)]/70 sm:w-[55%] sm:max-w-none lg:w-[31%]"
          >
            <FolderCover folder={folder} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <span className="block text-balance font-display text-2xl leading-tight text-white">{folder.label}</span>
            </div>
          </button>
        ))}
      </div>

      {folders.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(activeIndexRef.current - 1)}
            aria-label="Pasta anterior"
            className="absolute left-2 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-background/80 text-white backdrop-blur-sm transition-colors hover:border-[var(--client-accent)] hover:text-[var(--client-accent)]"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => goTo(activeIndexRef.current + 1)}
            aria-label="Próxima pasta"
            className="absolute right-2 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-background/80 text-white backdrop-blur-sm transition-colors hover:border-[var(--client-accent)] hover:text-[var(--client-accent)]"
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      )}
    </div>
  );
}

/** Grade de fotos (mesma usada no modo "pasta" e no modo "plano"). Cada foto abre o lightbox;
 *  com `allowDownload`, ganha um botão de download que passa pelo proxy `/api/download` — o
 *  atributo `download` sozinho não funciona em URL de outra origem (R2). */
function PhotoGrid({ photos, onOpen, allowDownload }: { photos: GalleryPhoto[]; onOpen: (index: number) => void; allowDownload?: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {photos.map((photo, index) => (
        <div
          key={photo.src}
          className="group relative overflow-hidden border border-white/10 bg-background transition-colors hover:border-[var(--client-accent)]/70"
        >
          <button type="button" onClick={() => onOpen(index)} className="block w-full" aria-label={`Abrir foto ${index + 1}`}>
            <img
              src={optimizedGallerySrc(photo.src, 640)}
              srcSet={`${optimizedGallerySrc(photo.src, 384)} 384w, ${optimizedGallerySrc(photo.src, 640)} 640w, ${optimizedGallerySrc(photo.src, 750)} 750w`}
              sizes="(min-width: 1024px) 23vw, (min-width: 640px) 31vw, 46vw"
              alt={photo.alt}
              loading="lazy"
              decoding="async"
              className="h-auto w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </button>
          {allowDownload && (
            <a
              href={`/api/download?src=${encodeURIComponent(photo.src)}`}
              download
              onClick={(event) => event.stopPropagation()}
              className="absolute right-2 top-2 z-10 flex size-10 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white backdrop-blur-sm transition-all hover:border-[var(--client-accent)] hover:text-[var(--client-accent)] sm:opacity-0 sm:group-hover:opacity-100"
              aria-label={`Baixar foto ${index + 1}`}
            >
              <Download className="size-4" />
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

/** Grade de vídeos do acervo. Cada card abre o vídeo em tela cheia (VideoLightbox); com download
 *  via proxy `/api/download`. Como são `.MOV` grandes, o card não tenta renderizar thumbnail —
 *  mostra um botão de play + o título, robusto em qualquer navegador. */
function VideoGrid({ videos, onOpen }: { videos: GalleryVideo[]; onOpen: (index: number) => void }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {videos.map((video, index) => (
        <div
          key={video.src}
          className="group relative aspect-video overflow-hidden border border-white/10 bg-background transition-colors hover:border-[var(--client-accent)]/70"
        >
          <button
            type="button"
            onClick={() => onOpen(index)}
            className="flex h-full w-full flex-col items-center justify-center gap-3 text-white/70 transition-colors group-hover:text-white"
            aria-label={`Assistir ${video.title}`}
          >
            <span className="flex size-14 items-center justify-center rounded-full border border-white/25 transition-colors group-hover:border-[var(--client-accent)] group-hover:text-[var(--client-accent)]">
              <Play className="size-6 translate-x-[1px]" />
            </span>
            <span className="px-3 text-center font-mono text-[11px] uppercase tracking-wide">{video.title}</span>
          </button>
          <a
            href={`/api/download?src=${encodeURIComponent(video.src)}`}
            download
            onClick={(event) => event.stopPropagation()}
            className="absolute right-2 top-2 z-10 flex size-10 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white backdrop-blur-sm transition-all hover:border-[var(--client-accent)] hover:text-[var(--client-accent)] sm:opacity-0 sm:group-hover:opacity-100"
            aria-label={`Baixar ${video.title}`}
          >
            <Download className="size-4" />
          </a>
        </div>
      ))}
    </div>
  );
}

export type GalleryExperienceProps = {
  folders: GalleryFolder[];
  /** Acervo de vídeos (opcional) — renderizado como uma seção "Vídeos" no modo plano. */
  videos?: GalleryVideo[];
  accessCodes: string[];
  lockScreenTitle: string;
  logo: string;
  brandName: string;
  driveUrl?: string;
  homeHref: string;
  /** `true` mostra botão de download em cada foto (ver `ClientConfig.gallery.allowDownload`). */
  allowDownload?: boolean;
};

export function GalleryExperience({ folders, videos, accessCodes, lockScreenTitle, logo, brandName, driveUrl, homeHref, allowDownload }: GalleryExperienceProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [videoIndex, setVideoIndex] = useState<number | null>(null);

  if (!unlocked) {
    return <LockScreen onUnlock={() => setUnlocked(true)} accessCodes={accessCodes} title={lockScreenTitle} logo={logo} brandName={brandName} />;
  }

  // Modo "plano": com uma única pasta, não faz sentido a etapa de escolher pasta — mostra todas
  // as fotos direto numa grade só (pedido da Dra. Sandra). Com várias pastas, mantém o carrossel.
  const flat = folders.length === 1;
  const activeFolder = flat ? folders[0] : folders.find((folder) => folder.id === activeFolderId) ?? null;
  const showTopBar = flat || !activeFolder;

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      {showTopBar && (
        <a
          href={homeHref}
          aria-label="Voltar para a página inicial"
          className="fixed left-3 top-6 z-50 flex size-12 items-center justify-center text-foreground/70 transition-colors hover:text-[var(--client-accent)] lg:left-9 lg:top-8"
        >
          <Home className="size-6" />
        </a>
      )}

      <section className="relative pb-14 pt-24 lg:pb-20 lg:pt-28">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          {flat && activeFolder ? (
            <>
              <header className="mb-8 flex flex-wrap items-end justify-between gap-4 lg:mb-10">
                <h1 className="text-balance font-display text-3xl leading-[0.95] tracking-tight sm:text-4xl md:text-6xl lg:text-7xl">
                  <AnimatedRevealText text="Galeria" />
                </h1>
                {driveUrl && <GalleryHintLink driveUrl={driveUrl} />}
              </header>

              {activeFolder.photos.length === 0 ? (
                <p className="border border-white/10 bg-background px-6 py-10 text-center text-muted-foreground">Nenhuma foto ainda.</p>
              ) : (
                <PhotoGrid photos={activeFolder.photos} onOpen={setLightboxIndex} allowDownload={allowDownload} />
              )}

              {videos && videos.length > 0 && (
                <div className="mt-16 lg:mt-20">
                  <header className="mb-8 lg:mb-10">
                    <h2 className="text-balance font-display text-3xl leading-[0.95] tracking-tight sm:text-4xl md:text-5xl">
                      <AnimatedRevealText text="Vídeos" />
                    </h2>
                  </header>
                  <VideoGrid videos={videos} onOpen={setVideoIndex} />
                </div>
              )}
            </>
          ) : !activeFolder ? (
            <>
              <header className="mb-8 flex flex-wrap items-end justify-between gap-4 lg:mb-10">
                <h1 className="text-balance font-display text-3xl leading-[0.95] tracking-tight sm:text-4xl md:text-6xl lg:text-7xl">
                  <AnimatedRevealText text="Galeria" />
                </h1>
                {driveUrl && <GalleryHintLink driveUrl={driveUrl} />}
              </header>

              <FolderCarousel folders={folders} onSelect={setActiveFolderId} />
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setActiveFolderId(null)}
                className="mb-8 inline-flex items-center font-mono text-sm text-muted-foreground transition-colors hover:text-foreground lg:mb-10"
              >
                Voltar para Galeria
              </button>

              <header className="mb-8 flex flex-wrap items-end justify-between gap-4 lg:mb-10">
                <h2 className="text-balance font-display text-3xl leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
                  <AnimatedRevealText key={activeFolder.id} text={activeFolder.label} />
                </h2>
                {driveUrl && <GalleryHintLink driveUrl={driveUrl} />}
              </header>

              {activeFolder.photos.length === 0 ? (
                <p className="border border-white/10 bg-background px-6 py-10 text-center text-muted-foreground">Nenhuma foto nesta pasta ainda.</p>
              ) : (
                <PhotoGrid photos={activeFolder.photos} onOpen={setLightboxIndex} allowDownload={allowDownload} />
              )}
            </>
          )}
        </div>
      </section>

      {activeFolder && lightboxIndex !== null && activeFolder.photos[lightboxIndex] && (
        <PhotoLightbox
          photo={activeFolder.photos[lightboxIndex]}
          hasPrev={lightboxIndex > 0}
          hasNext={lightboxIndex < activeFolder.photos.length - 1}
          onPrev={() => setLightboxIndex((current) => (current !== null ? current - 1 : current))}
          onNext={() => setLightboxIndex((current) => (current !== null ? current + 1 : current))}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {videos && videoIndex !== null && videos[videoIndex] && (
        <VideoLightbox
          video={videos[videoIndex]}
          hasPrev={videoIndex > 0}
          hasNext={videoIndex < videos.length - 1}
          onPrev={() => setVideoIndex((current) => (current !== null ? current - 1 : current))}
          onNext={() => setVideoIndex((current) => (current !== null ? current + 1 : current))}
          onClose={() => setVideoIndex(null)}
        />
      )}
    </main>
  );
}
