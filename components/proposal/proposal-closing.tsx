import { ArrowRight } from "lucide-react";
import type { ProposalContent } from "@/lib/clients/proposal-types";

export function ProposalClosing({ content, brandName, accent }: { content: ProposalContent["closing"]; brandName: string; accent: string }) {
  return (
    <section id="fechamento" className="scroll-mt-20 bg-black px-6 py-28 text-center text-white lg:px-12 lg:py-36">
      <div className="mx-auto flex max-w-2xl flex-col items-center">
        <h2 className="text-balance font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">{content.heading}</h2>

        <div className="mt-8 flex flex-col gap-3">
          {content.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-balance text-base leading-relaxed text-white/60 sm:text-lg">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-white/40">
          <span className="h-px w-8" style={{ backgroundColor: accent }} />
          {content.dateRange}
          <span className="h-px w-8" style={{ backgroundColor: accent }} />
        </div>

        <a
          href="#configurador"
          className="mt-10 inline-flex h-14 items-center justify-center gap-2 rounded-full px-8 text-sm font-medium text-black transition-transform duration-300 hover:scale-[1.03]"
          style={{ backgroundColor: accent }}
        >
          {content.ctaLabel}
          <ArrowRight className="size-4" />
        </a>

        <p className="mt-10 font-mono text-xs uppercase tracking-wide text-white/30">{brandName} × Procreating</p>
      </div>
    </section>
  );
}
