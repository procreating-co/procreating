"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { ProposalPascoalBadge } from "@/components/proposal-pascoal/proposal-pascoal-badge";
import type { ServiceStep } from "@/lib/pascoal-proposal/types";

function StepBlock({ step, accent, index, isLast }: { step: ServiceStep; accent: string; index: number; isLast: boolean }) {
  return (
    <div className="relative flex gap-6 sm:gap-10">
      {/* Marcador da timeline — círculo numerado + linha conectando ao próximo bloco */}
      <div className="flex flex-col items-center">
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-full border font-mono text-sm tabular-nums"
          style={{ borderColor: accent, color: accent }}
        >
          {step.number}
        </span>
        {!isLast && <span className="mt-2 w-px flex-1 bg-white/10" aria-hidden="true" />}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
        className="flex-1 border border-white/10 p-6 pb-10 sm:p-8 sm:pb-12"
      >
        <h3 className="font-display text-2xl text-white sm:text-3xl">{step.title}</h3>
        <p className="mt-3 max-w-lg text-balance text-sm leading-relaxed text-white/60 sm:text-base">{step.copy}</p>

        <div className="mt-7 grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-wide text-white/40">{step.includesLabel}</p>

            {step.includeFronts ? (
              <div className="flex flex-col gap-3">
                {step.includeFronts.map((front) => (
                  <div key={front.title} className="border border-white/10 px-4 py-3.5" style={{ backgroundColor: `${accent}0a` }}>
                    <p className="text-sm text-white/85">{front.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-white/45">{front.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {step.includeItems?.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-white/70">
                    <Check className="mt-0.5 size-3.5 shrink-0" style={{ color: accent }} />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-wide text-white/35">{step.excludesLabel}</p>
            <ul className="flex flex-col gap-2">
              {step.excludeItems.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-xs text-white/35">
                  <X className="mt-0.5 size-3 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-7 border-t border-white/10 pt-5 text-sm italic leading-relaxed text-white/45">{step.closing}</p>
      </motion.div>
    </div>
  );
}

/**
 * "Nossos Serviços" virou "Como Construímos Sua Operação" — timeline vertical de 3 etapas, não
 * mais 3 colunas horizontais genéricas. Cada etapa mantém inclui/não-inclui (etapa 03 usa 2
 * "frentes" em destaque em vez de bullets soltos, reformulação pedida).
 */
export function ProposalPascoalServiceSteps({
  intro,
  steps,
  accent,
}: {
  intro: { badge: string; heading: string };
  steps: ServiceStep[];
  accent: string;
}) {
  return (
    <section id="operacao" className="scroll-mt-20 bg-black px-6 py-24 text-white lg:px-12 lg:py-32">
      <div className="mx-auto max-w-4xl">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <ProposalPascoalBadge label={intro.badge} accent={accent} className="mb-6" />
          <h2 className="text-balance font-display text-3xl leading-[1.05] tracking-tight text-white sm:text-4xl md:text-5xl">{intro.heading}</h2>
        </div>

        <div className="mt-16 flex flex-col gap-2">
          {steps.map((step, index) => (
            <StepBlock key={step.title} step={step} accent={accent} index={index} isLast={index === steps.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
