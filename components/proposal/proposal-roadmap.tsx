"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Camera, Check } from "lucide-react";
import { ProposalSectionHeader } from "@/components/proposal/proposal-section-header";
import type { ProposalContent, RoadmapStage } from "@/lib/clients/proposal-types";
import type { RoadmapFunnel, RoadmapFunnelStage, RoadmapProductionBlock } from "@/lib/comercial/proposal-content-types";

function RoadmapStageRow({ stage, accent, index }: { stage: RoadmapStage; accent: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: index === 0 ? 0 : 0.05 }}
      className="relative flex gap-6 pl-2 lg:gap-10"
    >
      <span
        className="relative z-10 mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full border font-mono text-xs"
        style={{ borderColor: accent, color: accent, backgroundColor: "black" }}
      >
        {stage.number}
      </span>
      <div className="flex-1 pb-2">
        <h3 className="font-display text-2xl text-white sm:text-[26px]">{stage.title}</h3>
        <ul className="mt-4 flex flex-col gap-2.5">
          {stage.items.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-white/60 sm:text-base">
              <span className="mt-2 size-1 shrink-0 rounded-full bg-white/25" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

/** Bloco "N Diárias de Captação" (opcional) — pedido explícito, não existe na Elenita. Card único,
 *  composição de equipe + entregável em destaque. */
function ProductionBlock({ block, accent }: { block: RoadmapProductionBlock; accent: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mx-auto mt-16 flex max-w-2xl flex-col items-center gap-6 border border-white/10 p-8 text-center lg:p-10"
    >
      <Camera className="size-5" style={{ color: accent }} />
      <h3 className="font-display text-2xl text-white sm:text-3xl">{block.heading}</h3>
      <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {block.items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-white/60">
            <Check className="size-3.5 shrink-0" style={{ color: accent }} />
            {item}
          </li>
        ))}
      </ul>
      <p className="font-mono text-xs uppercase tracking-wide" style={{ color: accent }}>
        {block.deliverable}
      </p>
    </motion.div>
  );
}

/** Bloco "estratégia por trás" (opcional) — matriz perfis × etapas de funil + detalhe de cada
 *  etapa (objetivo + até 2 vídeos explicativos). Vídeo vazio = espaço reservado, sem placeholder
 *  visível (pedido: "deixar espaço para eu subir" — a estrutura já existe, o vídeo chega depois
 *  via editor). */
function FunnelBlock({ funnel, accent }: { funnel: RoadmapFunnel; accent: string }) {
  return (
    <div className="mx-auto mt-24 max-w-4xl">
      <h3 className="text-center font-display text-2xl text-white sm:text-3xl">{funnel.heading}</h3>

      {/* Matriz perfis × etapas — cada perfil é uma coluna, cada linha é uma etapa de funil.
          Auditoria mobile: 3 colunas de texto (nomes de etapa como "Conteúdo de Topo de
          Funil.") num grid de largura fixa espremia cada coluna a ~90px em telas de 320-375px,
          ilegível. `overflow-x-auto` no container (nunca na página) + `min-w` no grid — rola só
          essa matriz quando não cabe, sem gerar overflow horizontal na página inteira. */}
      <div className="mt-10 overflow-x-auto rounded-lg border border-white/10">
        <div className="grid min-w-[480px] gap-px bg-white/10" style={{ gridTemplateColumns: `repeat(${funnel.profiles.length}, 1fr)` }}>
          {funnel.profiles.map((profile) => (
            <div key={profile} className="bg-black px-3 py-3 text-center font-mono text-xs uppercase tracking-wide text-white/70">
              {profile}
            </div>
          ))}
          {funnel.stages.flatMap((stage) =>
            funnel.profiles.map((profile) => (
              <div key={`${stage.heading}-${profile}`} className="bg-black px-3 py-3 text-center text-xs text-white/45">
                {stage.heading}
              </div>
            )),
          )}
        </div>
      </div>

      {/* Detalhe de cada etapa — o primeiro vídeo (quando enviado) vira o FUNDO da própria
          etapa, texto por cima (não "3 players genéricos" — pedido explícito: integrar cada
          vídeo à narrativa daquela etapa). Sem vídeo, cai no texto plano de sempre. */}
      <div className="mt-14 flex flex-col gap-12">
        {funnel.stages.map((stage, index) => (
          <FunnelStageCard key={stage.heading} stage={stage} accent={accent} index={index} />
        ))}
      </div>
    </div>
  );
}

function FunnelStageCard({ stage, accent, index }: { stage: RoadmapFunnelStage; accent: string; index: number }) {
  const [mainVideo, ...extraVideos] = stage.videos;

  const heading = (
    <div className="flex items-center gap-3">
      <span className="h-px w-8 shrink-0" style={{ backgroundColor: accent }} />
      <h4 className="font-display text-xl text-white sm:text-2xl">{stage.heading}</h4>
    </div>
  );

  if (!mainVideo) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, delay: index * 0.06, ease: "easeOut" }}
        className="flex flex-col gap-4"
      >
        {heading}
        <p className="max-w-xl text-sm leading-relaxed text-white/55 sm:text-base">{stage.objective}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: "easeOut" }}
      className="flex flex-col gap-4"
    >
      {/* Vídeo de fundo — sem controles, ambiente (autoplay/muted/loop/playsInline), texto por
          cima com gradiente por baixo pra legibilidade. `overflow-hidden` + `object-cover`
          garantem que nenhuma orientação (horizontal/vertical) deforma ou estoura a largura. */}
      <div className="relative min-h-[340px] w-full overflow-hidden rounded-2xl border border-white/10 sm:min-h-[420px]">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video src={mainVideo.url} autoPlay muted loop playsInline className="absolute inset-0 size-full object-cover" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" aria-hidden="true" />
        <div className="relative flex min-h-[340px] flex-col justify-end gap-3 p-6 sm:min-h-[420px] sm:p-8">
          {heading}
          <p className="max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">{stage.objective}</p>
        </div>
      </div>

      {/* Vídeos adicionais da mesma etapa (raro — hoje cada etapa usa só 1) — tratamento
          secundário, com controles, não competem com o vídeo de fundo pela atenção. */}
      {extraVideos.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {extraVideos.map((video) => (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              key={video.url}
              src={video.url}
              controls
              preload="metadata"
              className={`w-full overflow-hidden rounded-lg border border-white/10 bg-black object-cover ${video.orientation === "vertical" ? "aspect-[9/16]" : "aspect-video"}`}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

/**
 * Roadmap — linha vertical lateral com indicador de progresso próprio (preenche conforme a seção
 * é rolada). Dois blocos NOVOS opcionais (`production`/`funnel`, `proposal-content-types.ts`) —
 * ausentes = renderiza exatamente como a proposta da Elenita sempre renderizou (só `stages`).
 */
export function ProposalRoadmap({
  content,
  accent,
}: {
  content: ProposalContent["roadmap"] & { production?: RoadmapProductionBlock | null; funnel?: RoadmapFunnel | null };
  accent: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start 0.7", "end 0.6"] });
  const lineScale = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });

  return (
    <section className="border-t border-white/10 bg-black px-6 py-24 text-white lg:px-12 lg:py-32">
      <div className="mx-auto max-w-3xl">
        <ProposalSectionHeader eyebrow="" heading={content.heading} accent={accent} />
        <p className="mx-auto mt-5 max-w-md text-balance text-center text-base leading-relaxed text-white/55">{content.subtitle}</p>
      </div>

      {content.stages.length > 0 && (
        <div ref={containerRef} className="relative mx-auto mt-16 max-w-2xl">
          <div className="absolute left-5 top-2 bottom-2 w-px bg-white/10" aria-hidden="true" />
          <motion.div className="absolute left-5 top-2 w-px origin-top" style={{ scaleY: lineScale, height: "calc(100% - 16px)", backgroundColor: accent }} aria-hidden="true" />

          <div className="flex flex-col gap-14">
            {content.stages.map((stage, index) => (
              <RoadmapStageRow key={stage.number} stage={stage} accent={accent} index={index} />
            ))}
          </div>
        </div>
      )}

      {content.production && <ProductionBlock block={content.production} accent={accent} />}
      {content.funnel && <FunnelBlock funnel={content.funnel} accent={accent} />}
    </section>
  );
}
