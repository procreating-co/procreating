import { Video } from "lucide-react";

/**
 * Seção "Vídeos" da Home da Pascoal (setembro/26) — mesma linguagem visual das seções de vídeo
 * da apresentação original (`how-it-works-section.tsx`): fundo `oklch(0.09 0.01 260)`, header
 * centralizado com `font-display`, número em `--client-accent`, containers com o aspect-ratio
 * REAL de cada formato (9/16 e 16/9).
 *
 * 12 espaços numerados de forma contínua (01–12: os 02 verticais primeiro, os 10 horizontais em
 * seguida — pedido explícito, nunca reinicia a contagem por grupo). Cada slot é independente:
 * com URL (`data/pascoal/setembro-videos.ts`) vira um `<video controls>` de verdade; sem URL
 * (`null` — arquivo ainda não subido), continua o placeholder "Em produção". `object-contain`
 * garante que o vídeo nunca é esticado nem cortado, seja qual for a dimensão real do arquivo.
 *
 * Verticais: 1 coluna larga até `md`, 2 por linha em cards grandes a partir de `md`.
 */

function VideoTile({ index, orientation, src }: { index: number; orientation: "vertical" | "horizontal"; src?: string | null }) {
  const isVertical = orientation === "vertical";
  const aspectClass = isVertical ? "aspect-[9/16]" : "aspect-video";
  const number = String(index).padStart(2, "0");
  return (
    <div className="w-full">
      <div className="mb-4 flex h-10 shrink-0 items-center gap-4 lg:mb-5">
        <span className="shrink-0 font-display text-3xl text-[var(--client-accent)]">{number}.</span>
        <span className="h-px min-w-6 flex-1 bg-white/15" />
        {!src && <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-white/35">Em produção</span>}
      </div>
      <div className={`relative ${aspectClass} w-full overflow-hidden rounded-lg border border-white/10 bg-black`}>
        {src ? (
          <video
            controls
            preload="metadata"
            playsInline
            className="absolute inset-0 h-full w-full object-contain"
            aria-label={`Vídeo ${orientation === "vertical" ? "vertical" : "horizontal"} ${number}`}
          >
            <source src={src} type="video/mp4" />
          </video>
        ) : (
          <span
            className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 text-white/30 ${
              isVertical ? "size-14 sm:size-16" : "size-14"
            }`}
          >
            <Video className={isVertical ? "size-5 sm:size-6" : "size-5"} />
          </span>
        )}
      </div>
    </div>
  );
}

export function VideosPlaceholderSection({
  verticalSrcs = [],
  horizontalSrcs = [],
}: {
  /** URLs dos 02 vídeos verticais, em ordem (01–02). `null`/posição ausente = placeholder. */
  verticalSrcs?: (string | null)[];
  /** URLs dos 10 vídeos horizontais, em ordem (03–12, numeração contínua com os verticais). */
  horizontalSrcs?: (string | null)[];
} = {}) {
  return (
    <section id="videos" className="relative overflow-hidden bg-[oklch(0.09_0.01_260)] pb-16 pt-8 text-white lg:pb-20 lg:pt-10">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <header className="mx-auto mb-14 max-w-4xl text-center sm:mb-16 lg:mb-20">
          <span className="mb-3 inline-flex items-center gap-3 font-mono text-sm text-white/45">
            <span className="h-px w-12 bg-[var(--client-accent)]" />
            Vídeos
            <span className="h-px w-12 bg-[var(--client-accent)]" />
          </span>
          <h2 className="text-balance font-display text-3xl leading-[1.02] tracking-tight sm:text-4xl md:text-6xl lg:text-7xl">
            Conteúdos para redes <span className="block text-white/40">da Julia e Pascoal</span>
          </h2>
        </header>

        <div className="flex flex-col gap-14 lg:gap-16">
          {/* Verticais (01–02) — 1 coluna larga no mobile/tablet, 2 cards grandes por linha no desktop. */}
          <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-8 md:grid-cols-2 md:gap-6 lg:gap-8">
            {[0, 1].map((i) => (
              <VideoTile key={i} index={i + 1} orientation="vertical" src={verticalSrcs[i]} />
            ))}
          </div>

          {/* Horizontais (03–12) — 1 coluna no mobile, 2 por linha a partir de `sm`. */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:gap-x-8 lg:gap-y-10">
            {Array.from({ length: 10 }, (_, i) => (
              <VideoTile key={i} index={i + 3} orientation="horizontal" src={horizontalSrcs[i]} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
