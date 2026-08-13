"use client";

import { motion } from "framer-motion";
import { Camera, Clapperboard } from "lucide-react";
import { ProposalPascoalSectionTexture } from "@/components/proposal-pascoal/proposal-pascoal-section-texture";
import type { PascoalProposalContent } from "@/lib/pascoal-proposal/types";

const ICONS = [Camera, Clapperboard];

export function ProposalPascoalPositioning({ content, accent }: { content: PascoalProposalContent["positioning"]; accent: string }) {
  return (
    <section className="relative overflow-hidden border-t border-white/10 bg-black px-6 py-24 text-white lg:px-12 lg:py-32">
      <ProposalPascoalSectionTexture accent={accent} corner="bottom-left" />

      <div className="relative mx-auto max-w-3xl">
        <h2 className="text-balance text-center font-display text-3xl leading-[1.05] tracking-tight text-white sm:text-4xl">{content.heading}</h2>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {content.cards.map((card, index) => {
            const Icon = ICONS[index] ?? Camera;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                className="flex flex-col items-start border border-white/10 p-7 sm:p-8"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border" style={{ borderColor: `${accent}40`, color: accent }}>
                  <Icon className="size-4.5" />
                </span>
                <h3 className="mt-5 font-display text-xl text-white">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{card.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
