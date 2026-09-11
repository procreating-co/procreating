import type { ProsMediaItem } from "@/content/pros/oficinas";
import { ProsMediaTile } from "@/components/pros/pros-media-tile";
import { Reveal } from "@/components/pros/reveal";

type Category = { label: string; item: ProsMediaItem };

/** "Seu negócio tem muito mais para mostrar." — pedido explícito: usar material real da Pascoal
 *  pra exemplificar categorias (estrutura, equipamentos, profissionais, bastidores...), sem virar
 *  lista genérica de serviços da Procreating — cada categoria É um exemplo visual, não um item de
 *  catálogo. */
export function ProsWhatCanBeShown({ headline, categories, onOpenVideo }: { headline: string; categories: Category[]; onOpenVideo: (src: string) => void }) {
  return (
    <section className="bg-black px-6 py-24 lg:px-12 lg:py-32">
      <div className="mx-auto max-w-[1400px]">
        <Reveal>
          <h2 className="mb-14 max-w-3xl text-balance font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:mb-20 lg:text-6xl">{headline}</h2>
        </Reveal>
        <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, i) => (
            <Reveal key={category.label} delayMs={i * 100} className="flex flex-col gap-4">
              <ProsMediaTile item={category.item} onOpenVideo={onOpenVideo} />
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">{category.label}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
