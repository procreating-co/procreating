"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowUpRight, Play } from "lucide-react";
import { ProcreatingMark } from "@/components/dashboard/procreating-mark";
import { r2Url } from "@/lib/r2";

/**
 * `/proposta/urbancompany` — Proposta Audiovisual da Procreating Co. para a Urban Company.
 *
 * Página one-off, construída à mão (fora do sistema de propostas do ERP), fiel ao PDF entregue
 * (8 slides, 30/10/2026). Todo o conteúdo comercial — datas, equipe, entregáveis, itens inclusos
 * e o valor (R$ 4.367) — vem EXATAMENTE do deck; nada foi inventado. A diagramação foi adaptada
 * de slides verticais para uma experiência web editorial/cinematográfica, alternando seções em
 * preto e claro como o próprio deck faz (capa/entregáveis/cases em preto; briefing/orçamento em
 * claro). Monocromático de propósito — a identidade da Procreating é preto e branco.
 *
 * Cases (slides 4–7 do deck) são imagens/vídeos do acervo que NÃO vieram como arquivos; os slots
 * ficam prontos pra receber a mídia (ver `CASES`). Sem CTA/aceite/formulário — não há no deck.
 */

/** Revela o conteúdo ao entrar na viewport (uma vez), com leve subida. */
function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12%" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

const ENTREGAVEIS = [
  { n: "01", kind: "Vídeo Horizontal", tag: "AFTER MOVIE" },
  { n: "01", kind: "Vídeo Vertical", tag: "HIGHLIGHTS" },
  { n: "+ de 200", kind: "Fotos", tag: "EDITADAS" },
];

const INCLUSO = [
  { n: "05", label: "horas de equipe" },
  { n: "01", label: "Videomaker" },
  { n: "02", label: "Fotógrafos" },
  { n: "02", label: "Vídeos editados" },
  { n: "+ de 200", label: "fotos editadas" },
];

/** Acervo (Cases) — vídeos reais no bucket R2 da Procreating. Play inline ao clicar. */
const CASES_R2 = "https://pub-f87d83578f1b4ce08acc561c934e7077.r2.dev";
const CASES: { src: string; label: string; aspect: string; span: string }[] = [
  { src: r2Url(CASES_R2, "Aftermovie Sophia XV.mp4"), label: "Aftermovie — Sophia XV", aspect: "aspect-video", span: "sm:col-span-12" },
  { src: r2Url(CASES_R2, "Fernanda XV.mp4"), label: "Fernanda XV", aspect: "aspect-video", span: "sm:col-span-6" },
  { src: r2Url(CASES_R2, "WhatsApp Video 2026-10-28 at 16.43.29.mp4"), label: "", aspect: "aspect-video", span: "sm:col-span-6" },
];

/** Tile de case: 1º frame do vídeo como capa + play; ao clicar, toca inline com controles. */
function CaseVideo({ src, label, aspect, span }: { src: string; label: string; aspect: string; span: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className={`${span} relative w-full overflow-hidden rounded-sm border border-white/10 bg-[#0c0c0c] ${aspect}`}>
      <video
        src={playing ? src : `${src}#t=0.5`}
        className={`absolute inset-0 h-full w-full ${playing ? "object-contain" : "object-cover"}`}
        preload="metadata"
        playsInline
        controls={playing}
        autoPlay={playing}
        muted={false}
      />
      {!playing && (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={label ? `Reproduzir ${label}` : "Reproduzir vídeo"}
          className="group absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 via-transparent to-transparent transition-colors hover:from-black/40"
        >
          <span className="flex size-16 items-center justify-center rounded-full border border-white/50 bg-black/30 text-white backdrop-blur-sm transition-colors group-hover:border-white group-hover:bg-black/50 sm:size-20">
            <Play className="size-6 translate-x-[2px] sm:size-7" />
          </span>
          {label && (
            <span className="absolute bottom-4 left-4 right-4 text-left font-mono text-[11px] uppercase tracking-[0.2em] text-white/80 sm:bottom-5 sm:left-6">
              {label}
            </span>
          )}
        </button>
      )}
    </div>
  );
}

export function UrbanProposal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  return (
    <div ref={containerRef} className="relative bg-black font-sans text-white">
      {/* Barra de progresso de leitura (sutil, premium — não é CTA) */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX: progress }}
        className="fixed inset-x-0 top-0 z-50 h-[2px] origin-left bg-white/70"
      />

      {/* Marca fixa discreta */}
      <div className="pointer-events-none fixed left-5 top-5 z-40 flex items-center gap-2 text-white/70 mix-blend-difference lg:left-9 lg:top-8">
        <ProcreatingMark className="size-5" />
        <span className="text-[11px] font-medium uppercase tracking-[0.3em]">Procreating</span>
      </div>

      {/* ───────────────── CAPA ───────────────── */}
      <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden px-6 pb-20 pt-28 lg:px-12 lg:pb-28">
        <div className="mx-auto w-full max-w-[1400px]">
          <Reveal>
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-white/50">30 de Outubro de 2026</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-4 font-display text-[clamp(2.75rem,10vw,8.5rem)] font-light leading-[0.95] tracking-tight">
              Proposta
              <br />
              Audiovisual.
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-5 flex items-baseline gap-3 font-display text-[clamp(1.5rem,5vw,3rem)] font-light tracking-tight text-white/45">
              <span className="text-white/25">|</span> Urban Company.
            </p>
          </Reveal>
        </div>
        <Reveal delay={0.3} className="mx-auto mt-16 flex w-full max-w-[1400px] items-center gap-3 text-white/40">
          <span className="h-px w-8 bg-white/30" />
          <span className="font-mono text-[11px] uppercase tracking-[0.25em]">Role para ver a proposta</span>
        </Reveal>
      </section>

      {/* ───────────────── BRIEFING (claro) ───────────────── */}
      <section className="bg-[#f4f3f1] px-6 py-24 text-[#0a0a0a] lg:px-12 lg:py-36">
        <div className="mx-auto grid w-full max-w-[1400px] gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
          <Reveal>
            <h2 className="font-display text-[clamp(2rem,5vw,3.75rem)] font-light leading-[1.02] tracking-tight">
              Briefing
              <br />
              do Projeto.
            </h2>
          </Reveal>

          <div className="flex flex-col">
            {[
              { k: "Data", v: "22/12/2026" },
              { k: "Hora", v: "18h30 – 23h30" },
              { k: "Local", v: "A definir." },
            ].map((row, i) => (
              <Reveal key={row.k} delay={i * 0.07}>
                <div className="flex items-baseline gap-5 border-b border-black/10 py-5">
                  <span className="w-20 shrink-0 font-mono text-xs uppercase tracking-[0.2em] text-black/45 sm:w-28">{row.k}</span>
                  <span className="font-display text-2xl font-light tracking-tight sm:text-4xl">{row.v}</span>
                </div>
              </Reveal>
            ))}

            <Reveal delay={0.1}>
              <div className="mt-10">
                <span className="font-mono text-xs uppercase tracking-[0.25em] text-black/45">Equipe</span>
                <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:gap-12">
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-4xl font-light sm:text-5xl">01</span>
                    <span className="text-lg text-black/70">Videomaker</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-4xl font-light sm:text-5xl">02</span>
                    <span className="text-lg text-black/70">Fotógrafos</span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ───────────────── ENTREGÁVEIS (preto) ───────────────── */}
      <section className="bg-black px-6 py-24 lg:px-12 lg:py-36">
        <div className="mx-auto w-full max-w-[1400px]">
          <Reveal>
            <h2 className="font-display text-[clamp(2rem,6vw,4.5rem)] font-light leading-[1] tracking-tight">Entregáveis.</h2>
          </Reveal>

          <div className="mt-14 lg:mt-20">
            {ENTREGAVEIS.map((item, i) => (
              <Reveal key={`${item.n}-${item.tag}`} delay={i * 0.08}>
                <div className="group flex flex-col gap-2 border-t border-white/12 py-8 sm:flex-row sm:items-baseline sm:gap-10 sm:py-10 lg:py-12">
                  <span className="font-display text-4xl font-light leading-none text-white/90 sm:w-48 sm:text-6xl lg:text-7xl">{item.n}</span>
                  <span className="text-base text-white/45 sm:flex-1 sm:text-xl">{item.kind}</span>
                  <span className="font-display text-xl font-medium uppercase tracking-tight sm:text-3xl lg:text-4xl">{item.tag}</span>
                </div>
              </Reveal>
            ))}
            <div className="border-t border-white/12" />
          </div>
        </div>
      </section>

      {/* ───────────────── CASES (preto, cinematográfico) ───────────────── */}
      <section className="bg-black px-6 pb-24 pt-10 lg:px-12 lg:pb-36">
        <div className="mx-auto w-full max-w-[1400px]">
          <Reveal>
            <h2 className="font-display text-[clamp(2rem,6vw,4.5rem)] font-light leading-[1] tracking-tight">Cases.</h2>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-12 lg:mt-14 lg:gap-5">
            {CASES.map((c, i) => (
              <Reveal key={c.src} delay={(i % 2) * 0.08} className={c.span}>
                <CaseVideo src={c.src} label={c.label} aspect={c.aspect} span="" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── ORÇAMENTO (claro) ───────────────── */}
      <section className="bg-[#f4f3f1] px-6 py-24 text-[#0a0a0a] lg:px-12 lg:py-36">
        <div className="mx-auto grid w-full max-w-[1400px] gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
          <div>
            <Reveal>
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-black/45">Incluso</span>
            </Reveal>
            <div className="mt-8">
              {INCLUSO.map((item, i) => (
                <Reveal key={item.label} delay={i * 0.06}>
                  <div className="flex items-baseline gap-5 border-b border-black/10 py-4">
                    <span className="w-24 shrink-0 font-display text-2xl font-light sm:text-3xl">{item.n}</span>
                    <span className="text-base text-black/70 sm:text-lg">{item.label}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={0.1} className="flex lg:justify-end">
            <div className="flex w-full flex-col justify-center lg:items-end lg:text-right">
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-black/45">Orçamento</span>
              <span className="mt-4 font-display text-[clamp(3.5rem,13vw,8rem)] font-light leading-none tracking-tight">
                R$&nbsp;4.367
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────────────── RODAPÉ ───────────────── */}
      <footer className="bg-black px-6 py-16 lg:px-12 lg:py-20">
        <div className="mx-auto w-full max-w-[1400px] border-t border-white/10 pt-10">
          <Reveal>
            <a
              href="https://www.procreatingco.com/"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-3 font-display text-2xl font-light tracking-tight text-white transition-colors hover:text-white/60 sm:text-3xl"
            >
              Conheça outros cases
              <ArrowUpRight className="size-6 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:size-7" />
            </a>
          </Reveal>

          <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5 text-white/80">
              <ProcreatingMark className="size-6" />
              <span className="text-sm font-medium uppercase tracking-[0.3em]">Procreating Co.</span>
            </div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
              Proposta Audiovisual · Urban Company · 30.10.2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
