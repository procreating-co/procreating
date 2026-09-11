import type { ProsMediaItem } from "@/content/pros/oficinas";
import { ProsMediaTile } from "@/components/pros/pros-media-tile";
import { Reveal } from "@/components/pros/reveal";

/**
 * "O que fizemos." — pedido explícito: composição editorial, NÃO grade convencional de cards
 * iguais. CSS multi-column (`columns-*`) em vez de `grid` com spans manuais — cada peça mantém a
 * proporção real (vertical/horizontal/quadrada) e a altura da coluna se ajusta sozinha, dando o
 * efeito de tamanhos/proporções diferentes sem masonry em JS. Todo material é real da Pascoal
 * (`content/pros/oficinas.ts`).
 */
export function ProsWhatWeDid({ heading, items, onOpenVideo }: { heading: string; items: ProsMediaItem[]; onOpenVideo: (src: string) => void }) {
  return (
    <section className="bg-black px-6 py-24 lg:px-12 lg:py-32">
      <div className="mx-auto max-w-[1400px]">
        <Reveal>
          <h2 className="mb-14 text-balance font-display text-4xl leading-[1.03] tracking-tight sm:text-5xl lg:mb-20 lg:text-7xl">{heading}</h2>
        </Reveal>
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
          {items.map((item, i) => (
            <Reveal key={i} delayMs={(i % 3) * 120} className="mb-5 break-inside-avoid">
              <ProsMediaTile item={item} onOpenVideo={onOpenVideo} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
