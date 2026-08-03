import { Image as ImageIcon } from "lucide-react";
import { SectionShell } from "@/components/presentation/section-shell";
import type { GalleryContent } from "@/lib/clients/presentation-types";

/** Bloco de apresentação — Galeria. Grade de espaços de foto reservados, rotulados — nunca uma foto real inventada. */
export function GallerySection({ id, eyebrow, content, accent }: { id: string; eyebrow: string; content: GalleryContent; accent: string }) {
  return (
    <SectionShell id={id} accent={accent} eyebrow={eyebrow} heading={content.heading} wide>
      <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">{content.body}</p>
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {content.placeholders.map((label) => (
          <div
            key={label}
            className="flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-2"
            style={{ borderColor: `${accent}33` }}
          >
            <ImageIcon className="size-5 text-muted-foreground/50" />
            <p className="text-center font-mono text-[10px] uppercase tracking-wide text-muted-foreground/60">{label}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
