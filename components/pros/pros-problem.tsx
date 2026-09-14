import { Reveal } from "@/components/pros/reveal";

/** "O Problema" — pedido explícito: composição editorial, tipográfica, sem sequência de cards. */
export function ProsProblem({ eyebrow, headline, paragraph }: { eyebrow: string; headline: string; paragraph: string }) {
  return (
    <section id="problema" className="bg-black px-6 py-28 lg:px-12 lg:py-40">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 text-center">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-white/40">{eyebrow}</p>
        </Reveal>
        <Reveal delayMs={80}>
          <h2 className="text-balance font-display text-4xl leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">{headline}</h2>
        </Reveal>
        <Reveal delayMs={160}>
          <p className="whitespace-pre-line text-balance text-lg leading-relaxed text-white/55 sm:text-xl">{paragraph}</p>
        </Reveal>
      </div>
    </section>
  );
}
