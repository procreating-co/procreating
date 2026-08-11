import type { PascoalProposalContent } from "@/lib/pascoal-proposal/types";

/** Sem CTA e sem badge de data — apresentação ao vivo, não landing page de venda. */
export function ProposalPascoalClosing({ content, brandName }: { content: PascoalProposalContent["closing"]; brandName: string }) {
  return (
    <section className="border-t border-white/10 bg-black px-6 py-28 text-center text-white lg:px-12 lg:py-36">
      <div className="mx-auto flex max-w-xl flex-col items-center">
        <h2 className="text-balance font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">{content.heading}</h2>
        <p className="mt-6 text-balance text-base leading-relaxed text-white/55 sm:text-lg">{content.paragraph}</p>
        <p className="mt-12 font-mono text-xs uppercase tracking-wide text-white/30">{brandName} × Procreating</p>
      </div>
    </section>
  );
}
