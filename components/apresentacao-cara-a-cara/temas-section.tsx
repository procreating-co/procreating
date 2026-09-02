const TEMAS: { label: string; path: string }[] = [
  { label: "Saúde", path: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" },
  {
    label: "Estética",
    path: "M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z",
  },
  {
    label: "Beleza",
    path: "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z",
  },
  {
    label: "Bem-estar",
    path: "M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z",
  },
  { label: "Qualidade de Vida", path: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" },
  {
    label: "Empreendedorismo",
    path: "M20.25 14.15v4.073a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a9.75 9.75 0 0 1-5.396 0l-1.32-.377A2.25 2.25 0 0 1 8.95 18.22V14.15M12 3 2.25 8.25 12 13.5l9.75-5.25L12 3Zm0 0v10.5",
  },
  {
    label: "Inovação",
    path: "M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18",
  },
  {
    label: "Desenvolvimento Humano",
    path: "M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z",
  },
];

/** Slide 5 — Temas do Programa (grid de 8 ícones). Porta 1:1 da referência (mesmos SVGs Heroicons). */
export function TemasSection() {
  return (
    <section className="cc-marble relative flex min-h-screen flex-col justify-center border-b border-[#B08D4F]/25 py-24">
      <div className="cc-container relative z-10 mx-auto px-6 md:px-12">
        <div className="cc-slide-in mb-14 text-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#B08D4F]">Conteúdo</span>
          <h2 className="cc-font-editorial mt-3 text-4xl text-[#2B2318] md:text-6xl">Temas do Programa</h2>
          <div className="cc-rule-gold mx-auto mt-6 w-40" />
        </div>

        <div className="cc-slide-in mx-auto grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {TEMAS.map((tema) => (
            <div key={tema.label} className="cc-glass-card flex items-center gap-4 rounded-2xl p-7">
              <svg className="h-7 w-7 shrink-0 text-[#B08D4F]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d={tema.path} />
              </svg>
              <p className="cc-font-sans text-base font-bold leading-snug text-[#2B2318]">{tema.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
