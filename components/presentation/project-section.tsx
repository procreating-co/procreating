import { SectionShell } from "@/components/presentation/section-shell";
import type { ProjectContent } from "@/lib/clients/presentation-types";

/** Bloco de apresentação — Projeto. Prosa + pilares em cards. */
export function ProjectSection({ id, eyebrow, content, accent }: { id: string; eyebrow: string; content: ProjectContent; accent: string }) {
  return (
    <SectionShell id={id} accent={accent} eyebrow={eyebrow} heading={content.heading}>
      <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">{content.body}</p>
      <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {content.pillars.map((pillar) => (
          <li key={pillar} className="rounded-xl border border-border/60 p-5 text-sm text-foreground">
            <span className="mb-3 block size-1.5 rounded-full" style={{ backgroundColor: accent }} />
            {pillar}
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
