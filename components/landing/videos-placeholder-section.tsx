import { Video } from "lucide-react";

/**
 * Seção "Vídeos" da Home da Pascoal (setembro/26) — mesma linguagem visual das seções de vídeo
 * da apresentação original (`how-it-works-section.tsx`): fundo `oklch(0.09 0.01 260)`, header
 * centralizado com `font-display`, número em `--client-accent`, containers com o aspect-ratio
 * REAL de cada formato (9/16 e 16/9).
 *
 * São placeholders — 02 verticais primeiro, 10 horizontais depois, numerados 01–12 de forma
 * contínua e SEM rótulo de grupo. Prontos pra receber a mídia depois; nada de vídeo/thumbnail
 * inventado, só o espaço reservado com o rótulo "Em produção" (mesma convenção do
 * `video-card.tsx`).
 *
 * Verticais: 1 coluna larga até `md`, 2 por linha em cards grandes a partir de `md` (pedido
 * explícito — antes ficavam pequenos demais, com vazio em volta). O aspect-ratio 9/16 é sempre
 * preservado; o que muda é só a largura do card.
 */

function PlaceholderTile({ index, orientation }: { index: number; orientation: "vertical" | "horizontal" }) {
  const isVertical = orientation === "vertical";
  const aspectClass = isVertical ? "aspect-[9/16]" : "aspect-video";
  const number = String(index).padStart(2, "0");
  return (
    <div className="w-full">
      <div className="mb-4 flex h-10 shrink-0 items-center gap-4 lg:mb-5">
        <span className="shrink-0 font-display text-3xl text-[var(--client-accent)]">{number}.</span>
        <span className="h-px min-w-6 flex-1 bg-white/15" />
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-white/35">Em produção</span>
      </div>
      <div className={`relative ${aspectClass} w-full overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]`}>
        <span
          className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 text-white/30 ${
            isVertical ? "size-14 sm:size-16" : "size-14"
          }`}
        >
          <Video className={isVertical ? "size-5 sm:size-6" : "size-5"} />
        </span>
      </div>
    </div>
  );
}

export function VideosPlaceholderSection() {
  return (
    <section id="videos" className="relative overflow-hidden bg-[oklch(0.09_0.01_260)] pb-16 pt-8 text-white lg:pb-20 lg:pt-10">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <header className="mx-auto mb-14 max-w-4xl text-center sm:mb-16 lg:mb-20">
          <h2 className="text-balance font-display text-4xl leading-[0.95] tracking-tight sm:text-5xl md:text-7xl lg:text-[96px]">Vídeos</h2>
          <p className="mt-4 text-base text-white/55 sm:mt-6 sm:text-lg">Conteúdos para as redes da Julia e Pascoal</p>
        </header>

        <div className="flex flex-col gap-14 lg:gap-16">
          {/* Verticais — 1 coluna larga no mobile/tablet, 2 cards grandes por linha no desktop. */}
          <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-8 md:grid-cols-2 md:gap-6 lg:gap-8">
            {[1, 2].map((n) => (
              <PlaceholderTile key={n} index={n} orientation="vertical" />
            ))}
          </div>

          {/* Horizontais — 1 coluna no mobile, 2 por linha a partir de `sm`. */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:gap-x-8 lg:gap-y-10">
            {Array.from({ length: 10 }, (_, i) => (
              <PlaceholderTile key={i} index={i + 3} orientation="horizontal" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
