"use client";

import { motion } from "framer-motion";
import { Compass, Radio, TrendingUp, Check, X } from "lucide-react";
import { ProposalPascoalBadge } from "@/components/proposal-pascoal/proposal-pascoal-badge";
import type { ServicePillar } from "@/lib/pascoal-proposal/types";

/** Um ícone distinto por pilar — a única diferença gráfica proposital entre os 3 (estrutura, hierarquia e quantidade de texto ficam idênticas). */
const PILLAR_ICONS = [Compass, Radio, TrendingUp];

function PillarCard({ pillar, accent, index }: { pillar: ServicePillar; accent: string; index: number }) {
  const Icon = PILLAR_ICONS[index] ?? Compass;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className="group flex h-full flex-col border border-white/10 p-7 transition-colors duration-500 hover:border-white/20 lg:p-8"
    >
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-full border transition-all duration-500 group-hover:scale-110"
        style={{ borderColor: `${accent}40`, color: accent }}
      >
        <Icon className="size-4.5" />
      </span>

      <h3 className="mt-6 font-display text-2xl text-white">{pillar.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-white/60">{pillar.copy}</p>

      <ul className="mt-6 flex flex-col gap-2.5">
        {pillar.bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-2.5 text-sm text-white/70">
            <Check className="mt-0.5 size-3.5 shrink-0" style={{ color: accent }} />
            {bullet}
          </li>
        ))}
      </ul>

      <p className="mt-6 text-sm italic leading-relaxed text-white/45">{pillar.closing}</p>

      {pillar.exclusions && (
        <div className="mt-7 border-t border-white/10 pt-5">
          <p className="mb-2.5 font-mono text-[10px] uppercase tracking-wide text-white/35">{pillar.exclusions.label}</p>
          <ul className="flex flex-col gap-1.5">
            {pillar.exclusions.items.map((item) => (
              <li key={item} className="flex items-center gap-2 text-xs text-white/35">
                <X className="size-3 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

/**
 * Os 3 pilares de serviço — substitui inteiramente os antigos blocos "Nossos serviços" (cards
 * 01/02/03 lado a lado) e os 3 blocos de metodologia com numeral fantasma (descontinuados a
 * pedido explícito: "não use mais a composição de números gigantes 01/02/03"). Um único formato
 * consistente (ícone → título → 1 frase → bullets → fechamento), altura igual via grid, só o
 * ícone muda de pilar pra pilar.
 */
export function ProposalPascoalServicePillars({
  intro,
  pillars,
  accent,
}: {
  intro: { badge: string; heading: string };
  pillars: ServicePillar[];
  accent: string;
}) {
  return (
    <section id="operacao" className="scroll-mt-20 bg-black px-6 py-24 text-white lg:px-12 lg:py-32">
      <div className="mx-auto max-w-[1300px]">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <ProposalPascoalBadge label={intro.badge} accent={accent} className="mb-6" />
          <h2 className="text-balance font-display text-3xl leading-[1.05] tracking-tight text-white sm:text-4xl md:text-5xl">{intro.heading}</h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-stretch">
          {pillars.map((pillar, index) => (
            <PillarCard key={pillar.title} pillar={pillar} accent={accent} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
