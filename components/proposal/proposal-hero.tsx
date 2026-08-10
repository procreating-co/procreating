import { ArrowRight } from "lucide-react";
import type { ProposalContent } from "@/lib/clients/proposal-types";

export function ProposalHero({ content, accent }: { content: ProposalContent["hero"]; accent: string }) {
  return (
    <section className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden bg-black px-6 text-center text-white lg:px-12">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.12] blur-[140px]" style={{ backgroundColor: accent }} />
      </div>

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center">
        <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-1.5 font-mono text-[11px] uppercase tracking-wide text-white/60">
          {content.eyebrow}
        </span>

        <h1 className="text-balance font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">{content.title}</h1>

        <p className="mt-8 max-w-2xl text-balance text-lg leading-relaxed text-white/60 sm:text-xl">{content.subtitle}</p>

        <div className="mt-6 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-white/40">
          <span className="h-px w-8" style={{ backgroundColor: accent }} />
          {content.dateRange}
          <span className="h-px w-8" style={{ backgroundColor: accent }} />
        </div>

        <a
          href={content.ctaHref}
          className="mt-12 inline-flex h-14 items-center justify-center gap-2 rounded-full px-8 text-sm font-medium text-black transition-all duration-300 hover:scale-[1.03]"
          style={{ backgroundColor: accent }}
        >
          {content.ctaLabel}
          <ArrowRight className="size-4" />
        </a>
      </div>
    </section>
  );
}
