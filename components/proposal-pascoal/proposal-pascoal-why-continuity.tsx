import { ProposalPascoalSectionHeader } from "@/components/proposal-pascoal/proposal-pascoal-section-header";
import type { PascoalProposalContent } from "@/lib/pascoal-proposal/types";

export function ProposalPascoalWhyContinuity({ content, accent }: { content: PascoalProposalContent["whyContinuity"]; accent: string }) {
  return (
    <section className="bg-black px-6 py-24 text-white lg:px-12 lg:py-32">
      <div className="mx-auto max-w-[1100px]">
        <ProposalPascoalSectionHeader eyebrow={content.eyebrow} heading={content.heading} accent={accent} />
        <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
          {content.points.map((point) => (
            <div key={point.number} className="flex flex-col gap-3">
              <span className="font-mono text-sm tabular-nums" style={{ color: accent }}>
                {point.number}
              </span>
              <h3 className="font-display text-xl text-white">{point.title}</h3>
              <p className="text-sm leading-relaxed text-white/55">{point.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
