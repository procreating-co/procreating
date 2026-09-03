/** Slide 4 — Objetivos (6 cards numerados). Porta 1:1 da referência. */
export function ObjetivosSection() {
  return (
    <section className="relative flex min-h-screen flex-col justify-center border-b border-[#B08D4F]/25 bg-[#F3EDE2] py-24">
      <div className="cc-container relative z-10 mx-auto px-6 md:px-12">
        <div className="cc-slide-in mb-14 text-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#B08D4F]">Cara a Cara com a Beleza</span>
          <h2 className="cc-font-editorial mt-3 text-4xl text-[#2B2318] md:text-6xl">Objetivos</h2>
          <div className="cc-rule-gold mx-auto mt-6 w-40" />
        </div>

        <div className="cc-slide-in mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-[1.75rem] border-b-4 border-[#D4AF37] bg-white p-8 shadow-sm">
            <span className="cc-font-editorial cc-text-gold mb-3 block text-5xl">01</span>
            <p className="cc-font-sans text-base leading-relaxed text-[#4A3E2C] md:text-lg">
              Tornar-se <strong className="text-[#2B2318]">referência em conteúdo de qualidade</strong> no segmento de saúde, estética e bem-estar.
            </p>
          </div>

          <div className="rounded-[1.75rem] border-b-4 border-[#B08D4F] bg-white p-8 shadow-sm">
            <span className="cc-font-editorial cc-text-gold mb-3 block text-5xl">02</span>
            <p className="cc-font-sans text-base leading-relaxed text-[#4A3E2C] md:text-lg">
              Promover <strong className="text-[#2B2318]">entrevistas e conversas relevantes</strong> com especialistas, profissionais e empreendedores.
            </p>
          </div>

          <div className="rounded-[1.75rem] border-b-4 border-[#D4AF37] bg-white p-8 shadow-sm">
            <span className="cc-font-editorial cc-text-gold mb-3 block text-5xl">03</span>
            <p className="cc-font-sans text-base leading-relaxed text-[#4A3E2C] md:text-lg">
              <strong className="text-[#2B2318]">Informar e inspirar</strong> o público com pautas aplicáveis ao cotidiano e à qualidade de vida.
            </p>
          </div>

          <div className="rounded-[1.75rem] border-b-4 border-[#B08D4F] bg-white p-8 shadow-sm">
            <span className="cc-font-editorial cc-text-gold mb-3 block text-5xl">04</span>
            <p className="cc-font-sans text-base leading-relaxed text-[#4A3E2C] md:text-lg">
              Fortalecer a marca da <strong className="text-[#2B2318]">Dra. Elenita</strong> como profissional de excelência.
            </p>
          </div>

          <div className="rounded-[1.75rem] border-b-4 border-[#D4AF37] bg-white p-8 shadow-sm">
            <span className="cc-font-editorial cc-text-gold mb-3 block text-5xl">05</span>
            <p className="cc-font-sans text-base leading-relaxed text-[#4A3E2C] md:text-lg">
              Ampliar <strong className="text-[#2B2318]">autoridade e credibilidade</strong> por meio de conteúdo acessível e ético.
            </p>
          </div>

          <div className="cc-marble-dark rounded-[1.75rem] border-b-4 border-[#D4AF37] p-8 shadow-lg">
            <span className="cc-font-editorial cc-text-gold mb-3 block text-5xl">06</span>
            <p className="cc-font-sans text-base leading-relaxed text-[#EBD9A8] md:text-lg">
              Entregar sempre um conteúdo de <strong className="text-white">alto nível</strong>, com padrão de imagem e curadoria à altura do tema.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
