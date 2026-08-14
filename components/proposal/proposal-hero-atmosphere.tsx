"use client";

import { motion } from "framer-motion";

/**
 * Camada de fundo da hero — degradê bordô extremamente sutil + grid quase imperceptível + glows
 * em profundidade com respiração lenta + uma trajetória abstrata (linhas finas ascendendo,
 * pontos discretos) com um ponto de luz percorrendo o caminho continuamente. O loop é
 * proposital — sugere "estratégia em movimento contínuo", não um efeito decorativo aleatório.
 * Tudo isolado aqui pra manter o componente da hero legível.
 */
export function ProposalHeroAtmosphere({ accent }: { accent: string }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {/* Degradê preto → bordô extremamente sutil, base de tudo */}
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse 80% 60% at 50% 30%, ${accent}14 0%, transparent 60%), linear-gradient(180deg, #000 0%, #000 70%, ${accent}0d 100%)` }}
      />

      {/* Grid quase imperceptível — dá textura sem competir com o texto, esmaece nas bordas */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, black 0%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, black 0%, transparent 75%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.04, 0.06, 0.04] }}
        transition={{ opacity: { duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.5 } }}
      />

      {/* Glows em camadas, respirando bem devagar — profundidade sem virar "fundo gamer" */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[640px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[150px]"
        style={{ backgroundColor: accent }}
        initial={{ opacity: 0.14, scale: 1 }}
        animate={{ opacity: [0.12, 0.18, 0.12], scale: [1, 1.06, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[8%] top-[18%] h-[320px] w-[320px] rounded-full blur-[120px]"
        style={{ backgroundColor: accent }}
        initial={{ opacity: 0.08 }}
        animate={{ opacity: [0.06, 0.1, 0.06] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
      <motion.div
        className="absolute bottom-[10%] left-[12%] h-[280px] w-[280px] rounded-full bg-white blur-[130px]"
        initial={{ opacity: 0.04 }}
        animate={{ opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Trajetória abstrata — linhas finas ascendendo, pontos discretos, e um ponto de luz percorrendo o caminho sem parar */}
      <motion.svg
        viewBox="0 0 1600 900"
        className="absolute inset-0 h-full w-full opacity-[0.35]"
        preserveAspectRatio="xMidYMid slice"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.35 }}
        transition={{ duration: 1.8, delay: 0.6, ease: "easeOut" }}
      >
        <motion.path
          id="hero-trajectory"
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

        {/* Ponto de luz viajando pela trajetória, em loop contínuo — o movimento tem sentido (estratégia em curso), não é decoração aleatória */}
        <circle r={3.5} fill={accent} opacity={0.9}>
          <animateMotion dur="7s" begin="2.6s" repeatCount="indefinite" path="M -80,760 C 280,700 420,560 620,520 C 860,470 980,300 1300,180" />
          <animate attributeName="opacity" values="0;0.9;0.9;0" keyTimes="0;0.08;0.92;1" dur="7s" begin="2.6s" repeatCount="indefinite" />
        </circle>
      </motion.svg>
    </div>
  );
}
