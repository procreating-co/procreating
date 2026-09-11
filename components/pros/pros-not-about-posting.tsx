import { Reveal } from "@/components/pros/reveal";

/** "Não é sobre postar" — pedido explícito: sequência de frases grandes durante o scroll, cada
 *  uma ocupando espaço significativo, animação sutil de entrada. Primeira e segunda frase maiores
 *  (o par "postar mais" / "mostrar melhor" é o contraste central), as seguintes um pouco menores. */
export function ProsNotAboutPosting({ lines }: { lines: string[] }) {
  return (
    <section className="flex flex-col bg-black">
      {lines.map((line, i) => (
        <div key={line} className="flex min-h-[38vh] items-center justify-center px-6 py-10 lg:px-12">
          <Reveal>
            <p className={`max-w-3xl text-balance text-center font-display leading-[1.1] tracking-tight ${i < 2 ? "text-4xl sm:text-6xl lg:text-7xl" : "text-3xl text-white/70 sm:text-5xl lg:text-6xl"}`}>
              {line}
            </p>
          </Reveal>
        </div>
      ))}
    </section>
  );
}
