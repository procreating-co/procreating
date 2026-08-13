"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ProposalPascoalBadge } from "@/components/proposal-pascoal/proposal-pascoal-badge";
import { ProposalPascoalSectionTexture } from "@/components/proposal-pascoal/proposal-pascoal-section-texture";
import type { PascoalProposalContent } from "@/lib/pascoal-proposal/types";

type Node = { x: number; y: number; r: number; delay: number; label: string };

function buildNodes(profiles: PascoalProposalContent["operationSystem"]["profiles"]): Node[] {
  const shortLabel = (name: string) => name.replace("Pascoal Bombas ", "");
  return [
    { x: 92, y: 150, r: 22, delay: 0, label: shortLabel(profiles[0]?.name ?? "") },
    { x: 308, y: 150, r: 22, delay: 0.3, label: shortLabel(profiles[1]?.name ?? "") },
    { x: 200, y: 58, r: 13, delay: 0.6, label: shortLabel(profiles[2]?.name ?? "") },
  ];
}

function curvePath(a: Node, b: Node): string {
  const midX = (a.x + b.x) / 2;
  const midY = (a.y + b.y) / 2 - 18;
  return `M${a.x},${a.y} Q${midX},${midY} ${b.x},${b.y}`;
}

/**
 * Diagrama com função real (pedido explícito): os 3 pontos são rotulados com os 3 perfis reais
 * (Zona Sul / Zona Norte / Julia), mostrando que compartilham um centro de estratégia em comum,
 * em vez de 3 círculos dourados decorativos sem informação. Pulso percorrendo as conexões em
 * loop (strokeDashoffset, sem lib nova) + leve respiração de escala. Respeita
 * prefers-reduced-motion.
 */
export function ProposalPascoalOperationAnimation({ accent, profiles }: { accent: string; profiles: PascoalProposalContent["operationSystem"]["profiles"] }) {
  const reduceMotion = useReducedMotion();
  const animate = !reduceMotion;
  const nodes = buildNodes(profiles);
  const connections: [Node, Node][] = [
    [nodes[0], nodes[1]],
    [nodes[0], nodes[2]],
    [nodes[1], nodes[2]],
  ];

  return (
    <svg viewBox="0 0 400 220" className="mx-auto w-full max-w-md" role="img" aria-label={`Três perfis conectados: ${nodes.map((n) => n.label).join(", ")}`}>
      {connections.map(([a, b], index) => {
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

      {nodes.map((node, index) => (
        <g key={index}>
          <motion.circle
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
          <text
            x={node.x}
            y={index === 2 ? node.y - 24 : node.y + node.r + 20}
            textAnchor="middle"
            className="fill-white/60"
            style={{ fontSize: 11, fontFamily: "var(--font-mono, monospace)", letterSpacing: "0.04em", textTransform: "uppercase" }}
          >
            {node.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function ProposalPascoalOperationSystem({ content, accent }: { content: PascoalProposalContent["operationSystem"]; accent: string }) {
  return (
    <section id="operacao" className="relative scroll-mt-20 overflow-hidden bg-black px-6 py-24 text-white lg:px-12 lg:py-32">
      <ProposalPascoalSectionTexture accent={accent} corner="top-right" />

      <div className="relative mx-auto flex max-w-2xl flex-col items-center text-center">
        <ProposalPascoalBadge label={content.badge} accent={accent} className="mb-6" />
        <h2 className="text-balance font-display text-3xl leading-[1.05] tracking-tight text-white sm:text-4xl md:text-5xl">{content.heading}</h2>
        <p className="mx-auto mt-5 max-w-md text-balance text-base leading-relaxed text-white/60">{content.paragraph}</p>
      </div>

      <div className="relative mx-auto mt-14 max-w-md">
        <ProposalPascoalOperationAnimation accent={accent} profiles={content.profiles} />
        <p className="mx-auto mt-4 max-w-xs text-balance text-center font-mono text-[11px] uppercase tracking-wide text-white/35">{content.diagramCaption}</p>
      </div>

      <div className="relative mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
        {content.profiles.map((profile) => (
          <div key={profile.name} className="border border-white/10 p-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: accent }}>
              {profile.tag}
            </span>
            <h3 className="mt-2.5 font-display text-lg text-white">{profile.name}</h3>
            <p className="mt-2 text-xs leading-relaxed text-white/55">{profile.strategy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
