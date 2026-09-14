import { Reveal } from "@/components/pros/reveal";

/** "Diferencial" — pedido explícito: por que a Procreating não é uma produtora convencional.
 *  Texto curto + pontos reais, sem afirmar diferencial que não seja verdade na operação. */
export function ProsDifferentiator({ eyebrow, headline, paragraph, points }: { eyebrow: string; headline: string; paragraph: string; points: string[] }) {
  return (
    <section className="bg-black px-6 py-28 lg:px-12 lg:py-40">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-white/40">{eyebrow}</p>
        </Reveal>
        <Reveal delayMs={80}>
          <h2 className="text-balance font-display text-4xl leading-[1.08] tracking-tight sm:text-5xl">{headline}</h2>
        </Reveal>
        <Reveal delayMs={160}>
          <p className="max-w-2xl text-balance text-lg leading-relaxed text-white/55">{paragraph}</p>
        </Reveal>
        <Reveal delayMs={240}>
          <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 pt-2 font-mono text-xs uppercase tracking-[0.15em] text-white/40">
            {points.map((point, i) => (
              <li key={point}>
                {point}
                {i < points.length - 1 && <span className="ml-3 text-white/15">/</span>}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
