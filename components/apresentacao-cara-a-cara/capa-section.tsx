import Image from "next/image";

/** Slide 1 — Capa. Porta 1:1 da referência (moldura dourada dupla, logo, citação, pills de temas). */
export function CapaSection() {
  return (
    <section className="cc-marble relative flex min-h-screen flex-col items-center justify-center overflow-hidden border-b border-[#B08D4F]/25 py-24">
      <div className="pointer-events-none absolute inset-5 border border-[#D4AF37]/35 md:inset-10" />
      <div className="pointer-events-none absolute inset-7 border border-[#D4AF37]/15 md:inset-12" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-8 text-center">
        <div className="cc-slide-in mb-6 h-16 w-px bg-gradient-to-b from-transparent to-[#D4AF37]" />
        <p className="cc-ornament cc-slide-in cc-font-sans mb-8 text-[10px] font-bold uppercase text-[#B08D4F] md:text-xs">Mídia Kit Oficial • 2026</p>

        <div className="cc-slide-in mx-auto flex w-full max-w-2xl justify-center">
          <Image
            src="/images/elenita-apresentacao/logo-cara-a-cara-com-a-beleza.png"
            alt="Cara a Cara com a Beleza"
            width={892}
            height={983}
            priority
            className="max-h-72 w-auto object-contain drop-shadow-[0_10px_30px_rgba(176,141,79,0.35)] md:max-h-[26rem]"
          />
        </div>

        <div className="cc-rule-gold cc-slide-in mb-8 mt-10 w-64" />

        <p className="cc-slide-in cc-font-serif max-w-2xl text-lg italic leading-relaxed text-[#4A3E2C] md:text-2xl">
          &ldquo;Conversas que revelam o que há de mais belo nas pessoas — por dentro e por fora.&rdquo;
        </p>

        <div className="cc-slide-in cc-glass-card mt-12 flex flex-wrap justify-center gap-4 rounded-full px-7 py-4 text-[10px] uppercase tracking-[0.22em] text-[#B08D4F] md:gap-6 md:px-10 md:text-xs font-bold">
          <span>Saúde</span>
          <span className="hidden text-[#D4AF37] md:inline">◆</span>
          <span>Estética &amp; Beleza</span>
          <span className="hidden text-[#D4AF37] md:inline">◆</span>
          <span>Bem-estar</span>
          <span className="hidden text-[#D4AF37] md:inline">◆</span>
          <span>Empreendedorismo</span>
          <span className="hidden text-[#D4AF37] md:inline">◆</span>
          <span>Desenvolvimento Humano</span>
        </div>

        <p className="cc-slide-in cc-font-sans mt-10 text-[10px] font-bold uppercase tracking-[0.3em] text-[#4A3E2C]/70 md:text-xs">
          RS Play &nbsp;•&nbsp; Claro TV+ Canal 524
        </p>
      </div>
    </section>
  );
}
