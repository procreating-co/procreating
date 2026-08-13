"use client";

import { motion } from "framer-motion";
import { CalendarDays, Layers, TrendingUp, MessageCircle, UserCircle, Send } from "lucide-react";
import type { PascoalProposalContent } from "@/lib/pascoal-proposal/types";

const ICONS = [CalendarDays, Layers, TrendingUp, MessageCircle, UserCircle, Send];

export function ProposalPascoalScope({ content, accent }: { content: PascoalProposalContent["scope"]; accent: string }) {
  return (
    <section className="border-t border-white/10 bg-black px-6 py-24 text-white lg:px-12 lg:py-32">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-balance text-center font-display text-3xl leading-[1.05] tracking-tight text-white sm:text-4xl">{content.heading}</h2>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {content.items.map((item, index) => {
            const Icon = ICONS[index] ?? Layers;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.45, delay: (index % 2) * 0.08, ease: "easeOut" }}
                className="flex items-start gap-4 border border-white/10 p-6"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border" style={{ borderColor: `${accent}40`, color: accent }}>
                  <Icon className="size-4" />
                </span>
                <div>
                  <h3 className="text-sm font-medium text-white/90">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/55">{item.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="mx-auto mt-12 max-w-2xl text-balance text-center text-sm leading-relaxed text-white/50">{content.closing}</p>
      </div>
    </section>
  );
}
