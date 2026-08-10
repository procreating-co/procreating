import type { PascoalProposalContent } from "@/lib/pascoal-proposal/types";

/** Sem CTA de propósito — apresentação ao vivo, não uma landing page de captação. */
export function ProposalPascoalClosing({ content, brandName, accent }: { content: PascoalProposalContent["closing"]; brandName: string; accent: string }) {
  return (
    <section className="border-t border-white/10 bg-black px-6 py-28 text-center text-white lg:px-12 lg:py-36">
      <div className="mx-auto flex max-w-2xl flex-col items-center">
        <span className="mb-6 h-px w-10" style={{ backgroundColor: accent }} aria-hidden="true" />
        <h2 className="text-balance font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">{content.heading}</h2>
        <p className="mt-6 max-w-lg text-balance text-base leading-relaxed text-white/55">{content.paragraph}</p>
        <p className="mt-10 font-mono text-xs uppercase tracking-wide text-white/35">{brandName}</p>
      </div>
    </section>
  );
}
