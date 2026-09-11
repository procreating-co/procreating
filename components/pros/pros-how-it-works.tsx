import { Reveal } from "@/components/pros/reveal";

type Step = { number: string; title: string; description: string };

/** "Como funciona" — pedido explícito: vertical, editorial, minimalista — sem cards. Uma lista
 *  numerada com linha divisória fina entre os passos. */
export function ProsHowItWorks({ steps }: { steps: Step[] }) {
  return (
    <section className="bg-black px-6 py-28 lg:px-12 lg:py-36">
      <div className="mx-auto max-w-4xl">
        <ul className="flex flex-col divide-y divide-white/10 border-y border-white/10">
          {steps.map((step, i) => (
            <li key={step.number} className="py-8 sm:py-10">
              <Reveal delayMs={i * 80} className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:gap-10">
                <span className="shrink-0 font-mono text-sm text-white/35 sm:w-16">{step.number}</span>
                <span className="shrink-0 font-display text-2xl sm:w-64 sm:text-3xl">{step.title}</span>
                <p className="max-w-md text-balance text-base leading-relaxed text-white/50">{step.description}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
