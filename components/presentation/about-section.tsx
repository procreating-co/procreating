import { SectionShell } from "@/components/presentation/section-shell";
import type { AboutContent } from "@/lib/clients/presentation-types";

/** Bloco de apresentação — Sobre. Prosa editorial, coluna estreita. */
export function AboutSection({ id, eyebrow, content, accent }: { id: string; eyebrow: string; content: AboutContent; accent: string }) {
  return (
    <SectionShell id={id} accent={accent} eyebrow={eyebrow} heading={content.heading} narrow>
      <p className="mt-6 text-base leading-relaxed text-muted-foreground">{content.body}</p>
    </SectionShell>
  );
}
