import type { ProposalContent } from "@/lib/clients/proposal-types";

export function ProposalInvestmentNote({ content, accent }: { content: ProposalContent["investmentNote"]; accent: string }) {
  return (
    <section className="bg-black px-6 py-20 text-white lg:px-12">
      <div className="mx-auto max-w-2xl border-l-2 pl-8" style={{ borderColor: accent }}>
        <h2 className="font-display text-2xl text-white sm:text-3xl">{content.heading}</h2>
        <div className="mt-5 flex flex-col gap-4">
          {content.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-base leading-relaxed text-white/55">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
