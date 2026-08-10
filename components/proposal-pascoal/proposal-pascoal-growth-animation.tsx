"use client";

import { motion } from "framer-motion";
import { ProposalPascoalSectionHeader } from "@/components/proposal-pascoal/proposal-pascoal-section-header";
import type { PascoalProposalContent } from "@/lib/pascoal-proposal/types";

/** 6 pontos em escada ascendente — mesma lógica usada pra gerar a polyline e posicionar os nós. */
const POINTS = [
  { x: 60, y: 300 },
  { x: 276, y: 254 },
  { x: 492, y: 208 },
  { x: 708, y: 162 },
  { x: 924, y: 116 },
  { x: 1140, y: 70 },
];

const PATH = `M${POINTS.map((point) => `${point.x},${point.y}`).join(" L")}`;

/**
 * Animação de crescimento — visual, não textual. Uma linha ascendente conecta 6 pontos
 * (Estratégia → ... → Crescimento), desenhando-se conforme entra na tela; cada nó pulsa em
 * sequência. `viewport={{ once: true }}` garante que a animação roda uma vez só.
 */
export function ProposalPascoalGrowthAnimation({ content, accent }: { content: PascoalProposalContent["growthAnimation"]; accent: string }) {
  return (
    <section className="bg-black px-6 py-24 text-white lg:px-12 lg:py-32">
      <div className="mx-auto max-w-4xl">
        <ProposalPascoalSectionHeader eyebrow={content.eyebrow} heading={content.heading} accent={accent} />
      </div>

      <div className="mx-auto mt-16 max-w-5xl">
        <svg viewBox="0 0 1200 340" className="w-full" role="img" aria-label={content.steps.join(" → ")}>
          <motion.path
            d={PATH}
            fill="none"
            stroke={accent}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity={0.45}
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
          />

          {POINTS.map((point, index) => (
            <motion.circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={7}
              fill={accent}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.22, ease: "easeOut" }}
            />
          ))}

          {POINTS.map((point, index) => (
            <motion.text
              key={index}
              x={point.x}
              y={point.y + 30}
              textAnchor={index === 0 ? "start" : index === POINTS.length - 1 ? "end" : "middle"}
              className="fill-current text-white/50"
              style={{ fontSize: 15, fontFamily: "var(--font-mono, monospace)", letterSpacing: "0.04em", textTransform: "uppercase" }}
              initial={{ opacity: 0, y: point.y + 40 }}
              whileInView={{ opacity: 1, y: point.y + 30 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: 0.45 + index * 0.22, ease: "easeOut" }}
            >
              {content.steps[index]}
            </motion.text>
          ))}
        </svg>
      </div>
    </section>
  );
}
