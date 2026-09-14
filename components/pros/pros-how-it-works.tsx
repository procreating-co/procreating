import { Reveal } from "@/components/pros/reveal";

type Step = { number: string; title: string; description: string };

/** "Como funciona" — pedido explícito: vertical, editorial, minimalista, sem fluxograma/timeline
 *  complexa — sequência clara, fácil de ler no celular. */
export function ProsHowItWorks({ eyebrow, headline, steps }: { eyebrow: string; headline: string; steps: Step[] }) {
  return (
    <section id="processo" className="bg-black px-6 py-28 lg:px-12 lg:py-40">
      <div className="mx-auto max-w-4xl">
        <Reveal className="mb-16 text-center lg:mb-20">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-white/40">{eyebrow}</p>
          <h2 className="text-balance font-display text-4xl leading-[1.08] tracking-tight sm:text-5xl">{headline}</h2>
        </Reveal>

        <ul className="flex flex-col divide-y divide-white/10 border-y border-white/10">
          {steps.map((step, i) => (
            <li key={step.number} className="py-8 sm:py-10">
              <Reveal delayMs={i * 80} className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:gap-10">
                <span className="shrink-0 font-mono text-sm text-white/35 sm:w-14">{step.number}</span>
                <span className="shrink-0 font-display text-2xl sm:w-56 sm:text-3xl">{step.title}</span>
                <p className="max-w-md text-balance text-base leading-relaxed text-white/55">{step.description}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
