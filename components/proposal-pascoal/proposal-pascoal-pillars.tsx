"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowRight } from "lucide-react";
import { ProposalPascoalSectionHeader } from "@/components/proposal-pascoal/proposal-pascoal-section-header";
import type { ProposalPillar } from "@/lib/pascoal-proposal/types";

/**
 * Expande no hover (desktop) e também por clique/toque (funciona em mobile, onde hover não
 * existe) — os dois gatilhos controlam o mesmo estado `isOpen`.
 */
function PillarCard({ pillar, accent }: { pillar: ProposalPillar; accent: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setIsOpen((current) => !current)}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      aria-expanded={isOpen}
      className="group flex h-full flex-1 flex-col border p-7 text-left transition-all duration-500 lg:p-9"
      style={{ borderColor: isOpen ? accent : "rgba(255,255,255,0.1)", backgroundColor: isOpen ? `${accent}0d` : "transparent" }}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="font-mono text-sm tabular-nums text-white/35">{pillar.number}</span>
        <ChevronDown className={`size-4 shrink-0 text-white/35 transition-transform duration-500 ${isOpen ? "rotate-180" : ""}`} />
      </div>

      <h3 className="mt-5 font-display text-2xl text-white sm:text-[26px]">{pillar.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-white/55">{pillar.description}</p>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="mt-2 flex flex-col gap-2 overflow-hidden"
          >
            {pillar.items.map((item) => (
              <li key={item} className="flex items-start gap-2.5 pt-4 text-sm text-white/65 first:pt-6">
                <span className="mt-1.5 size-1 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
                {item}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </button>
  );
}

export function ProposalPascoalPillars({
  intro,
  pillars,
  accent,
}: {
  intro: { eyebrow: string; heading: string; subtitle: string };
  pillars: ProposalPillar[];
  accent: string;
}) {
  return (
    <section id="operacao" className="scroll-mt-20 bg-black px-6 py-24 text-white lg:px-12 lg:py-32">
      <div className="mx-auto max-w-[1300px]">
        <ProposalPascoalSectionHeader eyebrow={intro.eyebrow} heading={intro.heading} accent={accent} />
        <p className="mx-auto mt-5 max-w-md text-balance text-center text-base leading-relaxed text-white/55">{intro.subtitle}</p>

        {/* Conectores entre os cards reforçam "uma mesma estrutura", não 3 serviços à parte */}
        <div className="mt-14 flex flex-col gap-4 lg:flex-row lg:items-stretch">
          {pillars.map((pillar, index) => (
            <div key={pillar.title} className="flex flex-col gap-4 lg:flex-1 lg:flex-row lg:items-stretch">
              <PillarCard pillar={pillar} accent={accent} />
              {index < pillars.length - 1 && (
                <div className="flex items-center justify-center py-1 lg:py-0">
                  <ArrowRight className="size-4 shrink-0 rotate-90 text-white/15 lg:rotate-0" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
