import { SectionShell } from "@/components/presentation/section-shell";
import type { StrategyContent } from "@/lib/clients/presentation-types";

/** Bloco de apresentação — Estratégia. Roteiro numerado. */
export function StrategySection({ id, eyebrow, content, accent }: { id: string; eyebrow: string; content: StrategyContent; accent: string }) {
  return (
    <SectionShell id={id} accent={accent} eyebrow={eyebrow} heading={content.heading}>
      <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">{content.body}</p>
      <ol className="mt-10 flex flex-col gap-6">
        {content.steps.map((step, index) => (
          <li key={step.title} className="flex gap-5">
            <span className="font-mono text-sm tabular-nums text-muted-foreground/60">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <p className="font-display text-lg text-foreground">{step.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}
