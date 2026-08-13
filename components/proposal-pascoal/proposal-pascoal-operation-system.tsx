"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ProposalPascoalBadge } from "@/components/proposal-pascoal/proposal-pascoal-badge";
import type { PascoalProposalContent } from "@/lib/pascoal-proposal/types";

type Node = { x: number; y: number; r: number; delay: number };

/** 2 nós maiores (os perfis da loja) + 1 nó menor (perfil pessoal da Júlia) — formas abstratas, sem logo. */
const NODES: Node[] = [
  { x: 92, y: 150, r: 22, delay: 0 },
  { x: 308, y: 150, r: 22, delay: 0.3 },
  { x: 200, y: 58, r: 13, delay: 0.6 },
];

const CONNECTIONS: [Node, Node][] = [
  [NODES[0], NODES[1]],
  [NODES[0], NODES[2]],
  [NODES[1], NODES[2]],
];

function curvePath(a: Node, b: Node): string {
  const midX = (a.x + b.x) / 2;
  const midY = (a.y + b.y) / 2 - 18;
  return `M${a.x},${a.y} Q${midX},${midY} ${b.x},${b.y}`;
}

/**
 * Animação de assinatura da seção — metáfora visual de "3 perfis conectados e crescendo", não
 * infográfico de dados. Pulso percorrendo as conexões em loop (via strokeDashoffset, técnica
 * leve, sem libs extras) + leve respiração de escala nos nós. Respeita prefers-reduced-motion.
 */
export function ProposalPascoalOperationAnimation({ accent }: { accent: string }) {
  const reduceMotion = useReducedMotion();
  const animate = !reduceMotion;

  return (
    <svg viewBox="0 0 400 200" className="mx-auto w-full max-w-md" role="img" aria-label="Três perfis conectados, crescendo juntos">
      {CONNECTIONS.map(([a, b], index) => {
        const d = curvePath(a, b);
        return (
          <g key={index}>
            <path d={d} stroke="white" strokeOpacity={0.08} strokeWidth={1.5} fill="none" />
            <motion.path
              d={d}
              stroke={accent}
              strokeOpacity={0.6}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeDasharray="6 46"
              fill="none"
              initial={{ strokeDashoffset: 0 }}
              animate={animate ? { strokeDashoffset: -52 } : undefined}
              transition={{ duration: 2.8, repeat: Infinity, ease: "linear", delay: index * 0.4 }}
            />
          </g>
        );
      })}

      {NODES.map((node, index) => (
        <motion.circle
          key={index}
          cx={node.x}
          cy={node.y}
          r={node.r}
          fill={accent}
          fillOpacity={index === 2 ? 0.9 : 0.16}
          stroke={accent}
          strokeWidth={index === 2 ? 0 : 1.5}
          style={{ transformOrigin: `${node.x}px ${node.y}px` }}
          animate={animate ? { scale: [1, 1.08, 1] } : undefined}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: node.delay }}
        />
      ))}
    </svg>
  );
}

export function ProposalPascoalOperationSystem({ content, accent }: { content: PascoalProposalContent["operationSystem"]; accent: string }) {
  return (
    <section id="operacao" className="scroll-mt-20 bg-black px-6 py-24 text-white lg:px-12 lg:py-32">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <ProposalPascoalBadge label={content.badge} accent={accent} className="mb-6" />
        <h2 className="text-balance font-display text-3xl leading-[1.05] tracking-tight text-white sm:text-4xl md:text-5xl">{content.heading}</h2>
        <p className="mx-auto mt-5 max-w-md text-balance text-base leading-relaxed text-white/60">{content.paragraph}</p>
      </div>

      <div className="mx-auto mt-14 max-w-md">
        <ProposalPascoalOperationAnimation accent={accent} />
      </div>
    </section>
  );
}
