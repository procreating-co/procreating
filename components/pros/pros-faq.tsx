import { ChevronDown } from "lucide-react";
import { Reveal } from "@/components/pros/reveal";

type FaqItem = { question: string; answer: string };

/**
 * FAQ — pedido explícito: só perguntas relevantes pra decisão de contratação (4, não preenchidas
 * artificialmente). `<details>/<summary>` nativo em vez de um Accordion Radix novo — acessível
 * (teclado, leitor de tela) e sem dependência nenhuma, o projeto não tinha um Accordion ainda.
 */
export function ProsFaq({ eyebrow, items }: { eyebrow: string; items: FaqItem[] }) {
  return (
    <section className="bg-black px-6 py-28 lg:px-12 lg:py-40">
      <div className="mx-auto max-w-3xl">
        <Reveal className="mb-14 text-center lg:mb-16">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-white/40">{eyebrow}</p>
        </Reveal>
        <div className="flex flex-col divide-y divide-white/10 border-y border-white/10">
          {items.map((item, i) => (
            <Reveal key={item.question} delayMs={i * 60}>
              <details className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                  <span className="text-balance font-display text-lg sm:text-xl">{item.question}</span>
                  <ChevronDown className="size-4 shrink-0 text-white/40 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-4 max-w-2xl text-balance text-base leading-relaxed text-white/55">{item.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
