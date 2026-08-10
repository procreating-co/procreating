import { Check } from "lucide-react";
import { ProposalSectionHeader } from "@/components/proposal/proposal-section-header";
import type { ProposalPillar } from "@/lib/clients/proposal-types";

function PillarCard({ pillar, accent }: { pillar: ProposalPillar; accent: string }) {
  return (
    <div className="flex h-full flex-col border border-white/10 bg-white/[0.02] p-7 transition-colors duration-300 hover:border-white/20 lg:p-8">
      <h3 className="font-display text-2xl text-white">{pillar.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-white/55">{pillar.description}</p>
      <ul className="mt-6 flex flex-1 flex-col gap-2.5">
        {pillar.items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-white/70">
            <Check className="mt-0.5 size-3.5 shrink-0" style={{ color: accent }} />
            {item}
          </li>
        ))}
      </ul>
      {pillar.note && <p className="mt-6 border-t border-white/10 pt-4 font-mono text-[11px] leading-relaxed text-white/40">{pillar.note}</p>}
    </div>
  );
}

export function ProposalPillars({ pillars, accent }: { pillars: ProposalPillar[]; accent: string }) {
  return (
    <section className="bg-black px-6 py-24 text-white lg:px-12 lg:py-32">
      <div className="mx-auto max-w-[1300px]">
        <ProposalSectionHeader eyebrow="Pilares da operação" heading="Cinco frentes trabalhando juntas" accent={accent} />
        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar) => (
            <PillarCard key={pillar.title} pillar={pillar} accent={accent} />
          ))}
        </div>
      </div>
    </section>
  );
}
