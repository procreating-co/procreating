"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { ProposalSectionHeader } from "@/components/proposal/proposal-section-header";
import type { ProposalContent, RoadmapStage } from "@/lib/clients/proposal-types";

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

/**
 * Roadmap Agosto–Dezembro — linha vertical lateral com indicador de progresso próprio (preenche
 * conforme a seção é rolada, `useScroll({ target })` escopado a este container, diferente da
 * barra de progresso global no topo da página). Cada etapa revela com fade + slide sutil ao
 * entrar na tela.
 */
export function ProposalRoadmap({ content, accent }: { content: ProposalContent["roadmap"]; accent: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start 0.7", "end 0.6"] });
  const lineScale = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });

  return (
    <section className="border-t border-white/10 bg-black px-6 py-24 text-white lg:px-12 lg:py-32">
      <div className="mx-auto max-w-3xl">
        <ProposalSectionHeader eyebrow="" heading={content.heading} accent={accent} />
        <p className="mx-auto mt-5 max-w-md text-balance text-center text-base leading-relaxed text-white/55">{content.subtitle}</p>
      </div>

      <div ref={containerRef} className="relative mx-auto mt-16 max-w-2xl">
        <div className="absolute left-5 top-2 bottom-2 w-px bg-white/10" aria-hidden="true" />
        <motion.div className="absolute left-5 top-2 w-px origin-top" style={{ scaleY: lineScale, height: "calc(100% - 16px)", backgroundColor: accent }} aria-hidden="true" />

        <div className="flex flex-col gap-14">
          {content.stages.map((stage, index) => (
            <RoadmapStageRow key={stage.number} stage={stage} accent={accent} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
