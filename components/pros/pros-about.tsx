import { Reveal } from "@/components/pros/reveal";

/** Procreating — pedido explícito: posicionamento curto ("transforma competência real em
 *  autoridade reconhecida"), nunca "somos uma agência de marketing"/linguagem de agência. Pilares
 *  como rótulos discretos, não cards de serviço. */
export function ProsAbout({ headline, paragraph, pillars }: { headline: string; paragraph: string; pillars: string[] }) {
  return (
    <section className="bg-black px-6 py-28 lg:px-12 lg:py-36">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 text-center">
        <Reveal>
          <h2 className="text-balance font-display text-4xl leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">{headline}</h2>
        </Reveal>
        <Reveal delayMs={150}>
          <p className="max-w-2xl text-balance text-lg leading-relaxed text-white/50 sm:text-xl">{paragraph}</p>
        </Reveal>
        <Reveal delayMs={300}>
          <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 pt-4 font-mono text-xs uppercase tracking-[0.2em] text-white/35">
            {pillars.map((pillar, i) => (
              <span key={pillar}>
                {pillar}
                {i < pillars.length - 1 && <span className="ml-3 text-white/15">/</span>}
              </span>
            ))}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
