"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronDown, RefreshCw } from "lucide-react";
import { ProposalPascoalSectionHeader } from "@/components/proposal-pascoal/proposal-pascoal-section-header";
import type { AcquisitionCard } from "@/lib/pascoal-proposal/types";

/**
 * "Estratégia de aquisição" — cards conectados (Mapeamento → Abordagem → Conexão → Conversão →
 * Crescimento), mesma interação de expandir do ProposalPascoalPillars (hover no desktop, clique
 * em qualquer dispositivo). O último card ganha um ícone de ciclo pra reforçar que a aquisição
 * realimenta o processo, em vez de terminar no primeiro contato.
 */
function AcquisitionCardItem({ card, accent, isLast }: { card: AcquisitionCard; accent: string; isLast: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setIsOpen((current) => !current)}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      aria-expanded={isOpen}
      className="group flex h-full flex-1 flex-col border p-6 text-left transition-all duration-500 lg:p-7"
      style={{ borderColor: isOpen ? accent : "rgba(255,255,255,0.1)", backgroundColor: isOpen ? `${accent}0d` : "transparent" }}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="font-mono text-sm tabular-nums text-white/35">{card.number}</span>
        {isLast ? <RefreshCw className="size-3.5 shrink-0 text-white/25" /> : <ChevronDown className={`size-4 shrink-0 text-white/35 transition-transform duration-500 ${isOpen ? "rotate-180" : ""}`} />}
      </div>

      <h3 className="mt-4 font-display text-xl text-white">{card.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/55">{card.description}</p>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="mt-2 flex flex-col gap-1.5 overflow-hidden"
          >
            {card.items.map((item) => (
              <li key={item} className="flex items-start gap-2 pt-3 text-xs text-white/60 first:pt-4">
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

export function ProposalPascoalAcquisition({
  content,
  accent,
}: {
  content: { eyebrow: string; heading: string; cards: AcquisitionCard[] };
  accent: string;
}) {
  return (
    <section className="border-t border-white/10 bg-black px-6 py-24 text-white lg:px-12 lg:py-32">
      <div className="mx-auto max-w-3xl">
        <ProposalPascoalSectionHeader eyebrow={content.eyebrow} heading={content.heading} accent={accent} />
      </div>

      <div className="mx-auto mt-14 flex max-w-6xl flex-col gap-4 lg:flex-row lg:items-stretch">
        {content.cards.map((card, index) => (
          <div key={card.title} className="flex flex-col gap-4 lg:flex-1 lg:flex-row lg:items-stretch">
            <AcquisitionCardItem card={card} accent={accent} isLast={index === content.cards.length - 1} />
            {index < content.cards.length - 1 && (
              <div className="flex items-center justify-center py-1 lg:py-0">
                <ArrowRight className="size-4 shrink-0 rotate-90 text-white/15 lg:rotate-0" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
