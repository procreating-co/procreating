import { SectionShell } from "@/components/presentation/section-shell";
import type { ContentSectionData } from "@/lib/clients/presentation-types";

/** Bloco de apresentação — Conteúdos. Prosa + tags de estratégia de conteúdo. */
export function ContentSection({ id, eyebrow, content, accent }: { id: string; eyebrow: string; content: ContentSectionData; accent: string }) {
  return (
    <SectionShell id={id} accent={accent} eyebrow={eyebrow} heading={content.heading}>
      <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">{content.body}</p>
      <div className="mt-8 flex flex-wrap gap-2">
        {content.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-wide"
            style={{ borderColor: `${accent}44`, color: accent }}
          >
            {tag}
          </span>
        ))}
      </div>
    </SectionShell>
  );
}
