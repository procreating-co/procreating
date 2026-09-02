const GALLERY_FILES = Array.from({ length: 11 }, (_, i) => `/images/elenita-apresentacao/cara-a-cara-${i + 1}.jpeg`);
// Duas sequências (original + loop) — mesmo truque da referência: a animação translada -50% do
// `width: max-content` do container (o dobro das fotos), criando um marquee infinito sem salto.
const MARQUEE_ITEMS = [...GALLERY_FILES, ...GALLERY_FILES];

/** Slide 7 — Galeria (carrossel infinito em CSS puro, sem JS/lib). Porta 1:1 da referência. */
export function GaleriaSection() {
  return (
    <section className="cc-marble relative flex min-h-screen flex-col justify-center overflow-hidden border-b border-[#B08D4F]/25 py-20">
      <div className="cc-container relative z-10 mx-auto mb-14 px-6 md:px-12">
        <div className="cc-slide-in text-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#B08D4F]">Galeria</span>
          <h2 className="cc-font-editorial mt-3 text-4xl text-[#2B2318] md:text-6xl">Cara a Cara com a Beleza</h2>
          <div className="cc-rule-gold mx-auto mt-6 w-40" />
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <div className="absolute bottom-0 left-0 top-0 z-10 w-16 bg-gradient-to-r from-[#FBF8F3] to-transparent md:w-32" />
        <div className="absolute bottom-0 right-0 top-0 z-10 w-16 bg-gradient-to-l from-[#FBF8F3] to-transparent md:w-32" />

        <div className="cc-animate-marquee flex gap-6">
          {MARQUEE_ITEMS.map((src, index) => (
            <div key={`${src}-${index}`} className="cc-gold-frame h-[430px] w-72 shrink-0 overflow-hidden rounded-[1.75rem] bg-[#F3EDE2] shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element -- carrossel decorativo, mesmo padrão usado no resto do projeto pra grids de galeria (gallery-experience.tsx) */}
              <img src={src} className="h-full w-full object-cover" alt="Cara a Cara com a Beleza" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
