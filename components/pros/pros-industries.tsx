import { Reveal } from "@/components/pros/reveal";

/** "Se você trabalha com..." — pedido explícito: apresentação visual e elegante das categorias,
 *  deixando claro que a página foi feita pra empresas como a do visitante. Tipografia grande, sem
 *  ícone/card — só uma lista tipográfica, mesma direção do resto da página. */
export function ProsIndustries({ headline, items }: { headline: string; items: string[] }) {
  return (
    <section className="bg-black px-6 py-28 lg:px-12 lg:py-36">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <h2 className="mb-14 text-balance text-center font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:mb-20">{headline}</h2>
        </Reveal>
        <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center sm:gap-x-6">
          {items.map((item, i) => (
            <li key={item} className="contents">
              <Reveal delayMs={i * 60}>
                <span className="font-display text-2xl leading-none text-white/80 sm:text-3xl lg:text-4xl">{item}</span>
              </Reveal>
              {i < items.length - 1 && <span aria-hidden="true" className="hidden text-2xl text-white/20 sm:inline lg:text-4xl">·</span>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
