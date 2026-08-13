"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Barra de progresso fixa no topo da página inteira — acompanha o scroll da proposta do
 * início ao fim (`useScroll()` sem `target` = progresso do documento todo, não de uma seção).
 * `useSpring` suaviza o movimento (sem seguir o scroll pixel a pixel, o que pareceria picotado).
 */
export function ProposalScrollProgress({ accent }: { accent: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });

  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-[3px] bg-white/5" aria-hidden="true">
      <motion.div className="h-full origin-left" style={{ scaleX, backgroundColor: accent }} />
    </div>
  );
}
