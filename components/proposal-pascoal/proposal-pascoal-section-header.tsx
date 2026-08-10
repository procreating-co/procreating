/**
 * Cabeçalho "eyebrow + heading" da Proposta de Continuidade da Pascoal — componente próprio,
 * isolado de `components/proposal/**` (usado pela Elenita) de propósito, pra Pascoal nunca
 * quebrar por causa de uma mudança feita lá.
 */
export function ProposalPascoalSectionHeader({
  eyebrow,
  heading,
  align = "center",
  accent,
}: {
  eyebrow: string;
  heading: string;
  align?: "center" | "left";
  accent: string;
}) {
  const alignClass = align === "center" ? "mx-auto text-center items-center" : "text-left items-start";
  return (
    <div className={`flex max-w-3xl flex-col ${alignClass}`}>
      <span className="mb-4 inline-flex items-center gap-3 font-mono text-xs uppercase tracking-wide text-white/45">
        <span className="h-px w-10 shrink-0" style={{ backgroundColor: accent }} />
        {eyebrow}
        {align === "center" && <span className="h-px w-10 shrink-0" style={{ backgroundColor: accent }} />}
      </span>
      <h2 className="text-balance font-display text-3xl leading-[1.05] tracking-tight text-white sm:text-4xl md:text-5xl">{heading}</h2>
    </div>
  );
}
