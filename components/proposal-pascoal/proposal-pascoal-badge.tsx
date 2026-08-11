/**
 * Selo/pill editorial — mesmo visual usado no eyebrow da hero e no badge de "Nossos serviços",
 * de propósito (pedido explícito: os dois blocos devem compartilhar o mesmo design). Componente
 * puramente apresentacional, sem animação própria — quem usa decide se anima (motion.div por fora).
 */
export function ProposalPascoalBadge({ label, accent, className = "" }: { label: string; accent: string; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 rounded-full border border-white/15 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-white/70 ${className}`}>
      <span className="size-1 shrink-0 rounded-full" style={{ backgroundColor: accent }} aria-hidden="true" />
      {label}
    </span>
  );
}
