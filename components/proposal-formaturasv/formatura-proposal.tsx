"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowUpRight, Play } from "lucide-react";
import { ProcreatingMark } from "@/components/dashboard/procreating-mark";
import { r2Url } from "@/lib/r2";

/**
 * `/proposta/formaturasv` — Proposta de Cobertura Audiovisual da Procreating Co. para uma
 * formatura em Florianópolis/SC.
 *
 * Adaptação fiel da proposta `urbancompany` (mesma linguagem editorial/cinematográfica,
 * tipografia, grid, seções alternando preto/claro, animações `Reveal` via framer-motion e o
 * mesmo `CaseVideo`). Conteúdo reescrito para o briefing de formatura; nada de valores internos,
 * remuneração de sócios ou prazos não aprovados. Página one-off, isolada da original — a Urban
 * Company não é referenciada e seu componente não é tocado.
 *
 * Cases: reaproveita EXATAMENTE os três vídeos reais já publicados na Urban (mesmo bucket R2,
 * mesmas URLs, mesmo player). Preço e nº de alunos ficam em constantes de configuração.
 */

// ── Configuração comercial (ajustável) ──────────────────────────────────────
// Preço comercial PRELIMINAR por aluno; total é derivado (nunca digitado à mão).
const PRICE_PER_ALUNO = 429.9;
const NUM_ALUNOS = 33;
const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const TOTAL = PRICE_PER_ALUNO * NUM_ALUNOS;
const MAX_PARCELAS = 12;

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

/** Pilares da cobertura. */
const PILARES = [
  {
    n: "01",
    titulo: "Fotografia",
    desc: "Três fotógrafos dedicados a registrar os momentos mais importantes do evento, com diferentes perspectivas, atenção aos detalhes, registros espontâneos e fotografias de grupo.",
  },
  {
    n: "02",
    titulo: "Produção Audiovisual",
    desc: "Um filmmaker responsável pela captação dos acontecimentos e das emoções da celebração, produzindo imagens que servirão de base para o filme final.",
  },
  {
    n: "03",
    titulo: "Pós-produção",
    desc: "Tratamento profissional das fotografias e edição audiovisual, com atenção à estética, à narrativa e à qualidade das entregas.",
  },
];

/**
 * Acervo (Cases). O vídeo principal (tela cheia) é o aftermovie da própria formatura (Famecos
 * 25.2), em bucket R2 próprio. Os outros dois reaproveitam os cases reais da proposta Urban.
 */
const CASES_R2 = "https://pub-f87d83578f1b4ce08acc561c934e7077.r2.dev";
const CASES: { src: string; label: string; aspect: string; span: string }[] = [
  { src: "https://pub-78e72cf4dd7043ea99c3b45cf1ae9b00.r2.dev/Melhores%20Momentos%20%20%20Formatura%20Famecos%2025.2%20V1.mp4", label: "Melhores Momentos — Formatura Famecos 25.2", aspect: "aspect-video", span: "sm:col-span-12" },
  { src: r2Url(CASES_R2, "Fernanda XV.mp4"), label: "Fernanda XV", aspect: "aspect-video", span: "sm:col-span-6" },
  { src: r2Url(CASES_R2, "Futuro Previdência - After Movie.mp4"), label: "Aftermovie — Futuro Previdência", aspect: "aspect-video", span: "sm:col-span-6" },
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

/** Blocos de equipe (captação e pós) — mesmo tamanho visual, número grande + rótulo. */
function EquipeGrupo({ titulo, itens }: { titulo: string; itens: { n: string; label: string }[] }) {
  return (
    <div>
      <span className="font-mono text-xs uppercase tracking-[0.25em] text-black/45">{titulo}</span>
      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-x-12 sm:gap-y-5">
        {itens.map((it) => (
          <div key={it.label} className="flex items-baseline gap-3">
            <span className="font-display text-5xl font-light sm:text-6xl">{it.n}</span>
            <span className="text-lg text-black/70">{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormaturaProposal() {
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

      {/* ───────────────── 01 · CAPA ───────────────── */}
      <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden px-6 pb-20 pt-28 lg:px-12 lg:pb-28">
        <div className="mx-auto w-full max-w-[1400px]">
          <Reveal>
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-white/50">18 de Novembro de 2026</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-4 font-display text-[clamp(2.75rem,10vw,8.5rem)] font-light leading-[0.95] tracking-tight">
              Proposta de
              <br />
              Cobertura.
            </h1>
          </Reveal>
        </div>
        <Reveal delay={0.3} className="mx-auto mt-16 flex w-full max-w-[1400px] items-center gap-3 text-white/40">
          <span className="h-px w-8 bg-white/30" />
          <span className="font-mono text-[11px] uppercase tracking-[0.25em]">Role para ver a proposta</span>
        </Reveal>
      </section>

      {/* ───────────────── COBERTURA AUDIOVISUAL (preto) ───────────────── */}
      <section className="bg-black px-6 py-24 lg:px-12 lg:py-36">
        <div className="mx-auto w-full max-w-[1400px]">
          <Reveal>
            <h2 className="max-w-4xl font-display text-[clamp(2rem,5.5vw,4.25rem)] font-light leading-[1.02] tracking-tight">
              Grandes conquistas merecem ser eternizadas.
            </h2>
          </Reveal>

          <div className="mt-14 lg:mt-20">
            {PILARES.map((item, i) => (
              <Reveal key={item.n} delay={i * 0.08}>
                <div className="flex flex-col gap-3 border-t border-white/12 py-8 sm:flex-row sm:gap-10 sm:py-10 lg:py-12">
                  <span className="font-display text-4xl font-light leading-none text-white/90 sm:w-48 sm:text-6xl lg:text-7xl">{item.n}</span>
                  <div className="sm:flex-1">
                    <h3 className="font-display text-2xl font-medium tracking-tight sm:text-3xl lg:text-4xl">{item.titulo}</h3>
                    <p className="mt-3 max-w-xl text-base leading-relaxed text-white/45 sm:text-lg">{item.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
            <div className="border-t border-white/12" />
          </div>
        </div>
      </section>

      {/* ───────────────── BRIEFING (claro) ───────────────── */}
      <section className="bg-[#f4f3f1] px-6 py-24 text-[#0a0a0a] lg:px-12 lg:py-36">
        <div className="mx-auto grid w-full max-w-[1400px] gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-20">
          <Reveal>
            <h2 className="font-display text-[clamp(2rem,5vw,3.75rem)] font-light leading-[1.02] tracking-tight">
              Briefing
              <br />
              do Projeto.
            </h2>
          </Reveal>

          <div className="flex flex-col">
            {[
              { k: "Local", v: "Florianópolis/SC" },
              { k: "Data do evento", v: "A definir." },
            ].map((row, i) => (
              <Reveal key={row.k} delay={i * 0.07}>
                <div className="flex items-baseline gap-5 border-b border-black/10 py-5">
                  <span className="w-24 shrink-0 font-mono text-xs uppercase tracking-[0.2em] text-black/45 sm:w-40">{row.k}</span>
                  <span className="font-display text-2xl font-light tracking-tight sm:text-4xl">{row.v}</span>
                </div>
              </Reveal>
            ))}

            {/* Equipe de captação — destaque visual */}
            <Reveal delay={0.1}>
              <div className="mt-10">
                <EquipeGrupo
                  titulo="Equipe de captação"
                  itens={[
                    { n: "03", label: "Fotógrafos" },
                    { n: "01", label: "Filmmaker" },
                    { n: "01", label: "Operador de Drone" },
                  ]}
                />
              </div>
            </Reveal>

            {/* Pós-produção — mesmo tamanho da captação */}
            <Reveal delay={0.16}>
              <div className="mt-8 border-t border-black/10 pt-8">
                <EquipeGrupo
                  titulo="Pós-produção"
                  itens={[
                    { n: "01", label: "Editor de Fotografia" },
                    { n: "01", label: "Editor de Vídeo" },
                  ]}
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ───────────────── CASES (preto, cinematográfico) ───────────────── */}
      <section className="bg-black px-6 py-24 lg:px-12 lg:py-36">
        <div className="mx-auto w-full max-w-[1400px]">
          <Reveal>
            <h2 className="font-display text-[clamp(2rem,6vw,4.5rem)] font-light leading-[1] tracking-tight">Nosso trabalho.</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/45 sm:text-lg">
              Cada evento carrega uma história única. Conheça algumas das produções que realizamos e a forma como
              transformamos momentos especiais em registros audiovisuais.
            </p>
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

      {/* ───────────────── INVESTIMENTO (preto) ───────────────── */}
      <section className="bg-black px-6 py-24 lg:px-12 lg:py-36">
        <div className="mx-auto w-full max-w-[1400px]">
          <Reveal>
            <h2 className="font-display text-[clamp(2rem,6vw,4.5rem)] font-light leading-[1] tracking-tight">Investimento.</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-4 font-display text-xl font-light tracking-tight text-white/50 sm:text-2xl">
              Uma lembrança para a vida inteira.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:mt-20 lg:gap-20">
            <Reveal>
              <div className="flex h-full flex-col justify-center">
                <p className="max-w-md text-base leading-relaxed text-white/55 sm:text-lg">
                  Uma operação audiovisual completa, contemplando equipe especializada, cobertura do evento, logística
                  e pós-produção.
                </p>
                <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.25em] text-white/40">
                  {NUM_ALUNOS} alunos · Total {brl(TOTAL)}
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.1} className="flex lg:justify-end">
              <div className="flex w-full flex-col justify-center lg:items-end lg:text-right">
                <span className="font-mono text-xs uppercase tracking-[0.25em] text-white/45">Valor por aluno</span>
                <span className="mt-4 font-display text-[clamp(3.25rem,12vw,7.5rem)] font-light leading-none tracking-tight">
                  {brl(PRICE_PER_ALUNO).replace(/\s/g, " ")}
                </span>
                <span className="mt-6 font-display text-3xl font-light leading-none tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Em até {MAX_PARCELAS}x
                </span>
                <span className="mt-2 font-mono text-[11px] uppercase tracking-[0.25em] text-white/50 lg:text-right">
                  Condições e taxas sob consulta
                </span>
                <span className="mt-5 max-w-xs font-mono text-[10px] uppercase leading-relaxed tracking-[0.2em] text-white/35 lg:text-right">
                  Valor comercial preliminar · sujeito à definição de escopo
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ───────────────── ENCERRAMENTO (preto) ───────────────── */}
      <section className="bg-black px-6 pb-16 pt-24 lg:px-12 lg:pb-20 lg:pt-36">
        <div className="mx-auto w-full max-w-[1400px]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.25rem,7vw,5.5rem)] font-light leading-[1.02] tracking-tight">
              O momento passa.
              <br />
              A história permanece.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/55 sm:text-xl">
              A Procreating Co. acredita que grandes momentos merecem grandes registros. Será um prazer fazer parte
              dessa conquista e transformar esse dia em uma memória à altura da sua importância.
            </p>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-10 font-display text-2xl font-light tracking-tight text-white/80 sm:text-3xl">Procreating Co.</p>
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
              Proposta de Cobertura Audiovisual · Formatura Florianópolis/SC · 18.11.2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
