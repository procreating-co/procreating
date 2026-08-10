import { ProposalSectionHeader } from "@/components/proposal/proposal-section-header";
import type { ProposalContent } from "@/lib/clients/proposal-types";

export function ProposalPositioning({ content, accent }: { content: ProposalContent["positioning"]; accent: string }) {
  return (
    <section className="bg-black px-6 py-24 text-white lg:px-12 lg:py-32">
      <div className="mx-auto max-w-3xl">
        <ProposalSectionHeader eyebrow={content.eyebrow} heading={content.heading} accent={accent} />
        <div className="mt-10 flex flex-col gap-5">
          {content.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-balance text-center text-base leading-relaxed text-white/60 sm:text-lg">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
