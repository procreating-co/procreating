/** Slide 3 — O Programa / Nossa Proposta + ficha técnica. Porta 1:1 da referência. */
export function PropostaSection() {
  return (
    <section className="cc-marble relative flex min-h-screen flex-col justify-center overflow-hidden border-b border-[#B08D4F]/25 py-24">
      <div className="cc-container relative z-10 mx-auto px-6 md:px-12">
        <div className="cc-slide-in mb-14 text-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#B08D4F]">O Programa</span>
          <h2 className="cc-font-editorial mt-3 text-4xl text-[#2B2318] md:text-6xl">Nossa Proposta</h2>
          <div className="cc-rule-gold mx-auto mt-6 w-40" />
        </div>

        <div className="cc-glass-card cc-slide-in mx-auto max-w-4xl rounded-[2rem] p-10 md:p-14">
          <div className="cc-font-sans space-y-7 text-lg font-light leading-relaxed text-[#4A3E2C] md:text-xl">
            <p>
              O programa tem como principal objetivo tornar-se uma <strong className="font-semibold text-[#2B2318]">referência em conteúdo de qualidade</strong>,
              promovendo entrevistas e conversas relevantes sobre saúde, estética, beleza, bem-estar, qualidade de vida, empreendedorismo, inovação e
              desenvolvimento humano.
            </p>
            <div className="cc-rule-gold w-full" />
            <p>
              Além de <strong className="font-semibold text-[#2B2318]">informar e inspirar</strong> o público, o projeto busca fortalecer a marca da Dra.
              Elenita como profissional de excelência, ampliando sua autoridade e credibilidade por meio de um conteúdo{" "}
              <em className="cc-font-serif text-2xl text-[#B08D4F]">acessível, ético e de alto nível</em>.
            </p>
          </div>
        </div>

        <div className="cc-slide-in mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="cc-glass-card rounded-2xl p-6 text-center">
            <h3 className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#B08D4F]">Gênero</h3>
            <p className="text-base font-bold text-[#2B2318]">Entrevistas — Saúde, Estética &amp; Beleza</p>
          </div>
          <div className="cc-glass-card rounded-2xl p-6 text-center">
            <h3 className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#B08D4F]">Apresentação</h3>
            <p className="text-base font-bold text-[#2B2318]">Dra. Elenita Luzardo</p>
          </div>
          <div className="cc-glass-card rounded-2xl p-6 text-center">
            <h3 className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#B08D4F]">Duração</h3>
            <p className="text-base font-bold text-[#2B2318]">27 minutos</p>
          </div>
          <div className="cc-glass-card rounded-2xl p-6 text-center">
            <h3 className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#B08D4F]">Distribuição</h3>
            <p className="text-base font-bold text-[#2B2318]">Inédito 1x/semana (48 ep/ano)</p>
          </div>
        </div>
      </div>
    </section>
  );
}
