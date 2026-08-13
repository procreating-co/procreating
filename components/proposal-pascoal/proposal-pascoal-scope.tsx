"use client";

import { motion } from "framer-motion";
import { ProposalPascoalSectionTexture } from "@/components/proposal-pascoal/proposal-pascoal-section-texture";
import type { PascoalProposalContent } from "@/lib/pascoal-proposal/types";

/**
 * Reorganizada por dono da entrega (pedido explícito, Problema 1): "Base para os 3 perfis"
 * (fundação compartilhada), "Zona Sul e Zona Norte" (lojas) e "Julia Brigidio" (perfil pessoal)
 * — cada grupo com sua tag, em vez da lista solta de 6 itens sem dono claro que existia antes.
 */
export function ProposalPascoalScope({ content, accent }: { content: PascoalProposalContent["scope"]; accent: string }) {
  return (
    <section className="relative overflow-hidden border-t border-white/10 bg-black px-6 py-24 text-white lg:px-12 lg:py-32">
      <ProposalPascoalSectionTexture accent={accent} corner="top-left" />

      <div className="relative mx-auto max-w-5xl">
        <h2 className="text-balance text-center font-display text-3xl leading-[1.05] tracking-tight text-white sm:text-4xl">{content.heading}</h2>

        <div className="mt-14 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-stretch">
          {content.groups.map((group, groupIndex) => (
            <motion.div
              key={group.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: groupIndex * 0.1, ease: "easeOut" }}
              className="flex flex-1 flex-col border border-white/10 p-6 sm:p-7"
            >
              <span className="inline-flex w-fit items-center rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em]" style={{ backgroundColor: `${accent}18`, color: accent }}>
                {group.tag}
              </span>
              <h3 className="mt-3 font-display text-xl text-white">{group.label}</h3>

              <div className="mt-5 flex flex-1 flex-col gap-5">
                {group.items.map((item) => (
                  <div key={item.title} className="border-t border-white/10 pt-4 first:border-t-0 first:pt-0">
                    <p className="text-sm font-medium text-white/90">{item.title}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-white/55">{item.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <p className="mx-auto mt-12 max-w-2xl text-balance text-center text-sm leading-relaxed text-white/50">{content.closing}</p>
      </div>
    </section>
  );
}
