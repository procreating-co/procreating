/** Slide 6 — Alcance da Emissora (bloco de destaque + YouTube/Instagram/TikTok). Porta 1:1 da referência. */
export function AlcanceSection() {
  return (
    <section className="relative flex min-h-screen flex-col justify-center overflow-hidden border-b border-[#B08D4F]/25 bg-[#F3EDE2] py-24">
      <div className="cc-container relative z-10 mx-auto px-6 md:px-12">
        <div className="cc-slide-in mb-14 text-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#B08D4F]">Distribuição</span>
          <h2 className="cc-font-editorial mt-3 text-4xl text-[#2B2318] md:text-6xl">Alcance da Emissora</h2>
          <p className="cc-font-serif mt-4 text-lg italic text-[#4A3E2C]/70 md:text-xl">O poder multiplataforma da emissora que transmite o programa.</p>
          <div className="cc-rule-gold mx-auto mt-6 w-40" />
        </div>

        {/* BLOCO PRINCIPAL */}
        <div className="cc-marble-dark cc-slide-in relative mb-10 flex flex-col items-center justify-between gap-10 overflow-hidden rounded-[2.5rem] p-8 shadow-2xl md:flex-row md:p-14">
          <div className="pointer-events-none absolute inset-4 rounded-[2rem] border border-[#D4AF37]/20" />

          <div className="relative z-10 text-center md:text-left">
            <span className="cc-bg-gradient-gold rounded-full px-5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#2B2318]">
              Ecossistema RS Play
            </span>
            <p className="cc-font-editorial cc-text-gold mb-3 mt-6 text-5xl leading-none md:text-7xl">
              14.388 <span className="cc-font-serif text-4xl">Milhões</span>
            </p>
            <p className="cc-font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-[#EBD9A8]/80">Alcance total da emissora multiplataforma</p>
          </div>

          <div className="relative z-10 flex gap-8 md:gap-12">
            <div className="border-l-2 border-[#D4AF37]/50 pl-6">
              <p className="cc-font-editorial text-4xl text-white">16M</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#EBD9A8]/70">
                Acessos
                <br />
                Plataforma TVSPlay
              </p>
            </div>
            <div className="border-l-2 border-[#D4AF37]/50 pl-6">
              <p className="cc-font-editorial text-4xl text-white">2M</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#EBD9A8]/70">
                Alcance
                <br />
                Claro TV+ (Canal 524)
              </p>
            </div>
          </div>
        </div>

        {/* REDES */}
        <div className="cc-slide-in grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="cc-gold-frame rounded-[1.75rem] bg-white p-8">
            <div className="mb-8 flex items-center gap-4 border-b border-[#B08D4F]/15 pb-4">
              <div className="rounded-2xl bg-[#EBD9A8]/40 p-3 text-[#B08D4F]">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2.5 7.1C2.3 8.3 2 10.3 2 12s.3 3.7.5 4.9c.3 1.5 1.5 2.7 3 3 1.2.2 4.2.4 6.5.4s5.3-.2 6.5-.4c1.5-.3 2.7-1.5 3-3 .2-1.2.5-3.2.5-4.9s-.3-3.7-.5-4.9c-.3-1.5-1.5-2.7-3-3-1.2-.2-4.2-.4-6.5-.4s-5.3.2-6.5.4c-1.5.3-2.7 1.5-3 3z" />
                  <path d="m10 15 5-3-5-3v6z" />
                </svg>
              </div>
              <div>
                <h3 className="cc-font-serif text-2xl font-bold text-[#2B2318]">YouTube</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#B08D4F]">Dados da plataforma</p>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="cc-font-editorial mb-1 text-4xl text-[#2B2318]">1,2M+</p>
                <p className="text-sm font-semibold text-[#4A3E2C]/60">Visualizações</p>
              </div>
              <div className="text-right">
                <p className="cc-font-editorial mb-1 text-3xl text-[#B08D4F]">19K</p>
                <p className="text-sm font-semibold text-[#4A3E2C]/60">Inscritos</p>
              </div>
            </div>
          </div>

          <div className="cc-gold-frame rounded-[1.75rem] bg-white p-8">
            <div className="mb-8 flex items-center gap-4 border-b border-[#B08D4F]/15 pb-4">
              <div className="rounded-2xl bg-[#EBD9A8]/40 p-3 text-[#B08D4F]">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect width={20} height={20} x={2} y={2} rx={5} ry={5} />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1={17.5} x2={17.51} y1={6.5} y2={6.5} />
                </svg>
              </div>
              <div>
                <h3 className="cc-font-serif text-2xl font-bold text-[#2B2318]">Instagram</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#B08D4F]">@rsplaydigital</p>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="cc-font-editorial mb-1 text-4xl text-[#2B2318]">+5.0M</p>
                <p className="text-sm font-semibold text-[#4A3E2C]/60">Alcance</p>
              </div>
              <div className="text-right">
                <p className="cc-font-editorial mb-1 text-3xl text-[#B08D4F]">163K</p>
                <p className="text-sm font-semibold text-[#4A3E2C]/60">Interações</p>
              </div>
            </div>
          </div>

          <div className="cc-gold-frame rounded-[1.75rem] bg-white p-8">
            <div className="mb-8 flex items-center gap-4 border-b border-[#B08D4F]/15 pb-4">
              <div className="rounded-2xl bg-[#EBD9A8]/40 p-3 text-[#B08D4F]">
                <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </div>
              <div>
                <h3 className="cc-font-serif text-2xl font-bold text-[#2B2318]">TikTok</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#B08D4F]">@rsplaydigital</p>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="cc-font-editorial mb-1 text-4xl text-[#2B2318]">784K</p>
                <p className="text-sm font-semibold text-[#4A3E2C]/60">Visualizações</p>
              </div>
              <div className="text-right">
                <p className="cc-font-editorial mb-1 text-3xl text-[#B08D4F]">48K</p>
                <p className="text-sm font-semibold text-[#4A3E2C]/60">Curtidas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
