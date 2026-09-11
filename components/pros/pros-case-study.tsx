import type { ProsMediaItem } from "@/content/pros/oficinas";
import { ProsMediaTile } from "@/components/pros/pros-media-tile";
import { Reveal } from "@/components/pros/reveal";

type CaseStudyProps = {
  title: string;
  subtitle: string;
  before: string;
  direction: string;
  afterItems: ProsMediaItem[];
  onOpenVideo: (src: string) => void;
};

/** Case Pascoal Bombas — pedido explícito: Antes → Direção → Depois. "Antes" e "Direção" são
 *  texto (não existe material real de "antes" pra mostrar — descrever é honesto, inventar uma
 *  foto/vídeo de "antes" não seria); "Depois" é a grade de material real. Sem métrica nenhuma —
 *  nenhuma foi fornecida, então nenhuma aparece. */
export function ProsCaseStudy({ title, subtitle, before, direction, afterItems, onOpenVideo }: CaseStudyProps) {
  return (
    <section className="bg-black px-6 py-28 lg:px-12 lg:py-36">
      <div className="mx-auto max-w-[1400px]">
        <Reveal className="mx-auto mb-16 max-w-3xl text-center lg:mb-24">
          <p className="mb-4 font-mono text-sm uppercase tracking-[0.2em] text-white/40">Case</p>
          <h2 className="mb-5 text-balance font-display text-5xl leading-[1.02] tracking-tight sm:text-7xl">{title}</h2>
          <p className="text-balance text-lg text-white/50 sm:text-xl">{subtitle}</p>
        </Reveal>

        <div className="mx-auto mb-20 flex max-w-4xl flex-col divide-y divide-white/10 border-y border-white/10 lg:mb-28">
          <Reveal className="flex flex-col gap-3 py-10 sm:flex-row sm:items-baseline sm:gap-10">
            <span className="shrink-0 font-mono text-sm uppercase tracking-[0.2em] text-white/40 sm:w-40">Antes</span>
            <p className="text-balance text-lg leading-relaxed text-white/70 sm:text-xl">{before}</p>
          </Reveal>
          <Reveal delayMs={100} className="flex flex-col gap-3 py-10 sm:flex-row sm:items-baseline sm:gap-10">
            <span className="shrink-0 font-mono text-sm uppercase tracking-[0.2em] text-white/40 sm:w-40">Direção</span>
            <p className="text-balance text-lg leading-relaxed text-white/70 sm:text-xl">{direction}</p>
          </Reveal>
          <Reveal delayMs={200} className="py-10">
            <span className="font-mono text-sm uppercase tracking-[0.2em] text-white/40">Depois</span>
          </Reveal>
        </div>

        <div className="columns-1 gap-5 sm:columns-2 lg:columns-4">
          {afterItems.map((item, i) => (
            <Reveal key={i} delayMs={(i % 4) * 120} className="mb-5 break-inside-avoid">
              <ProsMediaTile item={item} onOpenVideo={onOpenVideo} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
