import { Reveal } from "@/components/pros/reveal";

/** "O Problema" — pedido explícito: predominantemente tipográfica, muito espaço negativo, texto
 *  curto (nunca vira parágrafo longo). */
export function ProsProblem({ headline, paragraph }: { headline: string; paragraph: string }) {
  return (
    <section className="bg-black px-6 py-32 lg:px-12 lg:py-48">
      <div className="mx-auto flex max-w-4xl flex-col gap-10 text-center">
        <Reveal>
          <h2 className="text-balance font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">{headline}</h2>
        </Reveal>
        <Reveal delayMs={150}>
          <p className="whitespace-pre-line text-balance text-lg leading-relaxed text-white/50 sm:text-xl">{paragraph}</p>
        </Reveal>
      </div>
    </section>
  );
}
