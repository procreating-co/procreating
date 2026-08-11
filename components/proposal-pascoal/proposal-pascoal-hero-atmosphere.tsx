"use client";

import { motion } from "framer-motion";

/**
 * Camada de fundo da hero da Pascoal — grid quase imperceptível + glows em profundidade + uma
 * trajetória abstrata (linhas finas convergindo, alguns pontos) sugerindo
 * "estratégia → movimento → crescimento" sem virar um gráfico literal e sem nenhum texto
 * decorativo. Tudo isolado aqui pra manter o componente da hero legível — nenhuma dessas classes
 * ou animações é reaproveitada em nenhuma outra seção.
 */
export function ProposalPascoalHeroAtmosphere({ accent }: { accent: string }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {/* Grid quase imperceptível — dá textura sem competir com o texto, esmaece nas bordas */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, black 0%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, black 0%, transparent 75%)",
        }}
      />

      {/* Glows em camadas — profundidade sem virar "fundo gamer" */}
      <div className="absolute left-1/2 top-1/2 h-[640px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.14] blur-[150px]" style={{ backgroundColor: accent }} />
      <div className="absolute right-[8%] top-[18%] h-[320px] w-[320px] rounded-full opacity-[0.08] blur-[120px]" style={{ backgroundColor: accent }} />
      <div className="absolute bottom-[10%] left-[12%] h-[280px] w-[280px] rounded-full bg-white opacity-[0.04] blur-[130px]" />

      {/* Trajetória abstrata — linhas finas ascendendo, pontos discretos, deriva muito lenta */}
      <motion.svg
        viewBox="0 0 1600 900"
        className="absolute inset-0 h-full w-full opacity-[0.35]"
        preserveAspectRatio="xMidYMid slice"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.35 }}
        transition={{ duration: 1.8, delay: 0.6, ease: "easeOut" }}
      >
        <motion.path
          d="M -80,760 C 280,700 420,560 620,520 C 860,470 980,300 1300,180"
          fill="none"
          stroke={accent}
          strokeWidth={1}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 2.4, delay: 0.8, ease: "easeInOut" }}
        />
        <motion.path
          d="M -60,840 C 320,820 560,700 760,660 C 1020,610 1160,440 1500,340"
          fill="none"
          stroke="white"
          strokeWidth={1}
          strokeLinecap="round"
          strokeOpacity={0.12}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.6, delay: 1, ease: "easeInOut" }}
        />
        {[
          { cx: 620, cy: 520, delay: 1.6 },
          { cx: 980, cy: 300, delay: 1.9 },
          { cx: 1300, cy: 180, delay: 2.2 },
        ].map((point, index) => (
          <motion.circle
            key={index}
            cx={point.cx}
            cy={point.cy}
            r={3}
            fill={accent}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 0.8, 0.55], scale: 1 }}
            transition={{ duration: 0.6, delay: point.delay, ease: "easeOut" }}
          />
        ))}
      </motion.svg>
    </div>
  );
}
