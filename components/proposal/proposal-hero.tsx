import { ChevronDown } from "lucide-react";
import { ProposalTypingHeadline } from "@/components/proposal/proposal-typing-headline";
import { ProposalHeroAtmosphere } from "@/components/proposal/proposal-hero-atmosphere";
import type { ProposalContent } from "@/lib/clients/proposal-types";

export function ProposalHero({ content, accent }: { content: ProposalContent["hero"]; accent: string }) {
  return (
    <section className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden bg-black px-6 text-center text-white lg:px-12">
      <ProposalHeroAtmosphere accent={accent} />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center">
        <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-1.5 font-mono text-[11px] uppercase tracking-wide text-white/60">
          {content.eyebrow}
        </span>

        <ProposalTypingHeadline text={content.title} className="text-balance font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl md:text-7xl" />

        <p className="mt-8 max-w-xl text-balance text-lg leading-relaxed text-white/55 sm:text-xl">{content.subtitle}</p>
      </div>

      <a
        href="#operacao"
        aria-label="Rolar para a operação"
        className="absolute bottom-10 left-1/2 z-10 flex size-10 -translate-x-1/2 items-center justify-center rounded-full border border-white/15 text-white/40 transition-colors duration-300 hover:border-white/30 hover:text-white/70"
      >
        <ChevronDown className="size-4" />
      </a>
    </section>
  );
}
