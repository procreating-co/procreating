import { Reveal } from "@/components/pros/reveal";

type Pillar = { number: string; title: string; description: string };

/** "A Solução Procreating" — 4 pilares. Pedido explícito: nada de lista genérica de serviços nem
 *  excesso de ícones — cada pilar é número + título + 1 frase, layout vertical/editorial. */
export function ProsSolution({ eyebrow, headline, paragraph, pillars }: { eyebrow: string; headline: string; paragraph: string; pillars: Pillar[] }) {
  return (
    <section id="solucao" className="bg-black px-6 py-28 lg:px-12 lg:py-40">
      <div className="mx-auto max-w-4xl">
        <Reveal className="mb-16 flex flex-col gap-5 text-center lg:mb-20">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-white/40">{eyebrow}</p>
          <h2 className="text-balance font-display text-4xl leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">{headline}</h2>
          <p className="mx-auto max-w-2xl text-balance text-lg leading-relaxed text-white/55">{paragraph}</p>
        </Reveal>

        <ul className="flex flex-col divide-y divide-white/10 border-y border-white/10">
          {pillars.map((pillar, i) => (
            <li key={pillar.number} className="py-8 sm:py-10">
              <Reveal delayMs={i * 80} className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:gap-10">
                <span className="shrink-0 font-mono text-sm text-white/35 sm:w-14">{pillar.number}</span>
                <span className="shrink-0 font-display text-2xl sm:w-72 sm:text-3xl">{pillar.title}</span>
                <p className="max-w-md text-balance text-base leading-relaxed text-white/55">{pillar.description}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
