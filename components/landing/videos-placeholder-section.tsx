import { Video } from "lucide-react";

/**
 * Seção "Vídeos" da apresentação de setembro (`/clients/pascoal/public/setembro-26`) — mesma
 * linguagem visual das seções de vídeo da Home (`how-it-works-section.tsx`): fundo
 * `oklch(0.09 0.01 260)`, header centralizado com eyebrow de linha + `font-display`, número em
 * `--client-accent`, containers com o aspect-ratio REAL de cada formato (9/16 e 16/9).
 *
 * São placeholders — 02 verticais + 10 horizontais — prontos pra receber a mídia depois; não há
 * vídeo/thumbnail inventado, só o espaço reservado com o rótulo "Em produção" (mesma convenção
 * do `video-card.tsx`).
 */

function PlaceholderTile({ index, orientation }: { index: number; orientation: "vertical" | "horizontal" }) {
  const aspectClass = orientation === "vertical" ? "aspect-[9/16]" : "aspect-video";
  const number = String(index).padStart(2, "0");
  return (
    <div className="w-full">
      <div className="mb-4 flex h-10 shrink-0 items-center gap-4 lg:mb-5">
        <span className="shrink-0 font-display text-3xl text-[var(--client-accent)]">{number}.</span>
        <span className="h-px min-w-6 flex-1 bg-white/15" />
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-white/35">Em produção</span>
      </div>
      <div className={`relative ${aspectClass} w-full overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]`}>
        <span className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 text-white/30">
          <Video className="size-5" />
        </span>
      </div>
    </div>
  );
}

export function VideosPlaceholderSection() {
  return (
    <section id="videos" className="relative overflow-hidden bg-[oklch(0.09_0.01_260)] pb-16 pt-8 text-white lg:pb-20 lg:pt-10">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <header className="mx-auto mb-16 max-w-4xl text-center lg:mb-20">
          <span className="mb-3 inline-flex items-center gap-3 font-mono text-sm text-white/45">
            <span className="h-px w-12 bg-[var(--client-accent)]" />
            Setembro 2026
            <span className="h-px w-12 bg-[var(--client-accent)]" />
          </span>
          <h2 className="text-balance font-display text-4xl leading-[0.95] tracking-tight sm:text-5xl md:text-7xl lg:text-[96px]">Vídeos</h2>
          <p className="mt-5 text-base text-white/55 sm:mt-6 sm:text-lg">Conteúdos para as redes da Julia e Pascoal</p>
        </header>

        <div className="flex flex-col gap-16 lg:gap-20">
          <div>
            <div className="mb-6 flex items-baseline gap-3 sm:gap-4 lg:mb-8">
              <span className="font-mono text-sm text-white/40">01.</span>
              <h3 className="font-display text-2xl sm:text-3xl">Vídeos verticais</h3>
            </div>
            <div className="mx-auto flex max-w-2xl flex-col gap-5 sm:flex-row sm:justify-center">
              {[1, 2].map((n) => (
                <div key={n} className="w-full sm:max-w-[320px]">
                  <PlaceholderTile index={n} orientation="vertical" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-6 flex items-baseline gap-3 sm:gap-4 lg:mb-8">
              <span className="font-mono text-sm text-white/40">02.</span>
              <h3 className="font-display text-2xl sm:text-3xl">Vídeos horizontais</h3>
            </div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:gap-x-8 lg:gap-y-10">
              {Array.from({ length: 10 }, (_, i) => (
                <PlaceholderTile key={i} index={i + 1} orientation="horizontal" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
