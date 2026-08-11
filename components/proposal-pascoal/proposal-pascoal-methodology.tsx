"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { MethodologyBlock } from "@/lib/pascoal-proposal/types";

/** Bloco 01 — Assessoria: numeral fantasma grande + lista tipográfica separada por traços finos. Fundação, sóbria. */
function AssessoriaBlock({ block, accent }: { block: MethodologyBlock; accent: string }) {
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr] lg:gap-16">
      <div className="flex items-start lg:justify-start">
        <span className="font-display text-[96px] leading-none text-white/[0.06] lg:text-[140px]" aria-hidden="true">
          {block.number}
        </span>
      </div>
      <div>
        <h3 className="font-display text-2xl text-white sm:text-3xl">{block.title}</h3>
        <p className="mt-4 max-w-lg text-balance text-sm leading-relaxed text-white/60 sm:text-base">{block.paragraph}</p>
        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
          {block.tags.map((tag, index) => (
            <span key={tag} className="flex items-center gap-5">
              {index > 0 && <span className="h-3 w-px bg-white/15" aria-hidden="true" />}
              <span className="font-mono text-xs uppercase tracking-wide text-white/50">{tag}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Bloco 02 — Posicionamento: layout espelhado + tags como um fluxo conectado (pipeline de produção). */
function PosicionamentoBlock({ block, accent }: { block: MethodologyBlock; accent: string }) {
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_220px] lg:gap-16">
      <div className="lg:text-right">
        <h3 className="font-display text-2xl text-white sm:text-3xl">{block.title}</h3>
        <p className="ml-auto mt-4 max-w-lg text-balance text-sm leading-relaxed text-white/60 sm:text-base">{block.paragraph}</p>

        <div className="mt-9 flex flex-wrap items-center gap-2 lg:justify-end">
          {block.tags.map((tag, index) => (
            <div key={tag} className="flex items-center gap-2">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
                className="flex items-center gap-2 rounded-full border border-white/15 py-1.5 pl-1.5 pr-3.5"
              >
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px]" style={{ backgroundColor: `${accent}20`, color: accent }}>
                  {index + 1}
                </span>
                <span className="text-xs text-white/70">{tag}</span>
              </motion.div>
              {index < block.tags.length - 1 && <ArrowRight className="size-3 shrink-0 text-white/15" />}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-start justify-end lg:order-first">
        <span className="font-display text-[96px] leading-none text-white/[0.06] lg:text-[140px]" aria-hidden="true">
          {block.number}
        </span>
      </div>
    </div>
  );
}

/** Bloco 03 — Aquisição: numeral fantasma + tags como cluster solto (sugere amplitude/rede de canais). */
function AquisicaoBlock({ block, accent }: { block: MethodologyBlock; accent: string }) {
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr] lg:gap-16">
      <div className="flex items-start lg:justify-start">
        <span className="font-display text-[96px] leading-none text-white/[0.06] lg:text-[140px]" aria-hidden="true">
          {block.number}
        </span>
      </div>
      <div>
        <h3 className="font-display text-2xl text-white sm:text-3xl">{block.title}</h3>
        <p className="mt-4 max-w-lg text-balance text-sm leading-relaxed text-white/60 sm:text-base">{block.paragraph}</p>
        <div className="mt-8 flex flex-wrap gap-2.5">
          {block.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wide text-white/60 transition-all duration-300 hover:text-white"
              style={{ borderColor: "rgba(255,255,255,0.14)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = accent;
                e.currentTarget.style.boxShadow = `0 0 16px ${accent}25`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

const BLOCK_RENDERERS = [AssessoriaBlock, PosicionamentoBlock, AquisicaoBlock];

/**
 * Os 3 blocos de metodologia — substituem inteiramente as antigas seções "Operação de conteúdo"
 * e "Estratégia de aquisição" (removidas). Mesma família (numeral fantasma, título, parágrafo
 * comercial curto), mas cada bloco com composição e tratamento visual das tags própria, pra não
 * virar "três cards genéricos iguais".
 */
export function ProposalPascoalMethodology({ blocks, accent }: { blocks: MethodologyBlock[]; accent: string }) {
  return (
    <section className="border-t border-white/10 bg-black px-6 py-24 text-white lg:px-12 lg:py-32">
      <div className="mx-auto flex max-w-5xl flex-col gap-20 lg:gap-24">
        {blocks.map((block, index) => {
          const Renderer = BLOCK_RENDERERS[index] ?? AssessoriaBlock;
          return (
            <motion.div key={block.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, ease: "easeOut" }}>
              <Renderer block={block} accent={accent} />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
