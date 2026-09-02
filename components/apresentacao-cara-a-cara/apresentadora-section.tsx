import Image from "next/image";

/** Slide 2 — A Idealizadora (Dra. Elenita Luzardo). Porta 1:1 da referência. */
export function ApresentadoraSection() {
  return (
    <section className="relative min-h-screen border-b border-[#B08D4F]/25 bg-[#F3EDE2] py-24">
      <div className="cc-container relative z-10 mx-auto px-6 md:px-12">
        <div className="flex flex-col items-center gap-16 lg:flex-row">
          <div className="cc-slide-in relative w-full lg:w-4/12">
            <div className="cc-gold-frame absolute -left-4 -top-4 h-full w-full rounded-2xl" />
            <div className="relative z-10 h-[600px] w-full overflow-hidden rounded-xl shadow-2xl">
              <Image
                src="/images/elenita-apresentacao/cara-a-cara-1.jpeg"
                alt="Dra. Elenita Luzardo"
                fill
                sizes="(min-width: 1024px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>

          <div className="cc-slide-in w-full lg:w-8/12">
            <div className="mb-4 flex items-center gap-4">
              <div className="h-[2px] w-12 bg-[#D4AF37]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#B08D4F]">A Idealizadora</span>
            </div>

            <h2 className="cc-font-editorial mb-8 text-4xl leading-tight text-[#2B2318] md:text-6xl">
              Dra. Elenita Luzardo, <span className="cc-text-gold cc-font-serif italic">a beleza como cuidado</span>
            </h2>

            <p className="cc-font-sans mb-5 text-justify text-base leading-relaxed text-[#4A3E2C] md:text-lg">
              Cirurgiã-dentista, pós-graduada em <strong>Saúde Estética Avançada</strong>. Com 20 anos de experiência em gestão empresarial e atuação na
              área da saúde, dedica-se ao desenvolvimento de protocolos personalizados voltados ao <strong>rejuvenescimento facial</strong> e à
              valorização da <strong>beleza natural</strong>.
            </p>
            <p className="cc-font-sans mb-10 text-justify text-base leading-relaxed text-[#4A3E2C]/85">
              À frente do programa, une o rigor técnico da saúde à sensibilidade de quem entende a beleza como expressão de bem-estar — conduzindo
              entrevistas que informam, inspiram e aproximam.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="cc-glass-card rounded-2xl p-6 text-center">
                <p className="cc-font-serif text-4xl font-bold text-[#2B2318]">20</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#B08D4F]">Anos de experiência</p>
              </div>
              <div className="cc-glass-card rounded-2xl p-6 text-center">
                <p className="cc-font-serif text-4xl font-bold text-[#2B2318]">CD</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#B08D4F]">Cirurgiã-dentista</p>
              </div>
              <div className="cc-glass-card rounded-2xl p-6 text-center">
                <p className="cc-font-serif text-4xl font-bold text-[#2B2318]">Pós</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#B08D4F]">Saúde Estética Avançada</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
