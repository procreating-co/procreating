import { Reveal } from "@/components/pros/reveal";

/** "A primeira impressão" — pedido explícito: mostrar a jornada Google → Instagram → Site →
 *  WhatsApp → Contato. Sem ícone genérico — só tipografia + uma linha vertical fina conectando
 *  os passos (mesma linguagem minimalista do resto da página). */
export function ProsFirstImpression({ headline, steps, note }: { headline: string; steps: string[]; note: string }) {
  return (
    <section className="bg-black px-6 py-28 lg:px-12 lg:py-36">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-16 text-center lg:flex-row lg:items-start lg:gap-20 lg:text-left">
        <Reveal className="lg:w-1/2">
          <h2 className="text-balance font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">{headline}</h2>
        </Reveal>

        <div className="flex flex-col items-center gap-8 lg:w-1/2 lg:items-start">
          <ol className="flex flex-col items-center gap-0 lg:items-start">
            {steps.map((step, i) => (
              <Reveal key={step} delayMs={i * 120}>
                <li className="flex flex-col items-center gap-0 lg:items-start">
                  <span className="font-display text-2xl text-white sm:text-3xl">{step}</span>
                  {i < steps.length - 1 && <span aria-hidden="true" className="my-2 h-8 w-px bg-white/20" />}
                </li>
              </Reveal>
            ))}
          </ol>
          <Reveal delayMs={steps.length * 120}>
            <p className="max-w-sm text-balance text-base leading-relaxed text-white/50">{note}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
