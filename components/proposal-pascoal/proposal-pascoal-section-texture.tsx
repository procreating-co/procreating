/**
 * Camada de profundidade para o fundo das seções (tudo abaixo da hero, que tem sua própria
 * atmosfera em proposal-pascoal-hero-atmosphere.tsx e não usa isto). Fundo plano preto é o
 * padrão mais comum de página gerada por IA agora — aqui: grão fino (textura, não decoração
 * genérica), uma grade horizontal fina lembrando linhas de feed/grade editorial, e um glow
 * radial sutil ancorado num canto (varia por seção pra não repetir sempre igual). Nenhum brilho
 * de partícula, nada chamativo.
 */
const NOISE_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

const CORNER_POSITION: Record<"top-right" | "top-left" | "bottom-right" | "bottom-left", string> = {
  "top-right": "top-0 right-0 translate-x-1/3 -translate-y-1/3",
  "top-left": "top-0 left-0 -translate-x-1/3 -translate-y-1/3",
  "bottom-right": "bottom-0 right-0 translate-x-1/3 translate-y-1/3",
  "bottom-left": "bottom-0 left-0 -translate-x-1/3 translate-y-1/3",
};

export function ProposalPascoalSectionTexture({ accent, corner = "top-right" }: { accent: string; corner?: keyof typeof CORNER_POSITION }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Grão fino */}
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: `url("${NOISE_SVG}")`, backgroundSize: "180px 180px" }} />
      {/* Grade horizontal fina, tipo linhas de feed */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "repeating-linear-gradient(to bottom, rgba(255,255,255,0.6) 0px, rgba(255,255,255,0.6) 1px, transparent 1px, transparent 96px)" }}
      />
      {/* Glow radial sutil ancorado num canto */}
      <div className={`absolute h-[420px] w-[420px] rounded-full opacity-[0.07] blur-[130px] ${CORNER_POSITION[corner]}`} style={{ backgroundColor: accent }} />
    </div>
  );
}
