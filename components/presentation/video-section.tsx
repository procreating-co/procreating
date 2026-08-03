import { PlayCircle } from "lucide-react";
import { SectionShell } from "@/components/presentation/section-shell";
import type { VideosContent } from "@/lib/clients/presentation-types";

/** Bloco de apresentação — Vídeos. Espaços de vídeo reservados, rotulados — nunca um vídeo real inventado. */
export function VideoSection({ id, eyebrow, content, accent }: { id: string; eyebrow: string; content: VideosContent; accent: string }) {
  return (
    <SectionShell id={id} accent={accent} eyebrow={eyebrow} heading={content.heading}>
      <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">{content.body}</p>
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {content.placeholders.map((label) => (
          <div
            key={label}
            className="flex aspect-video flex-col items-center justify-center gap-2 rounded-xl border border-dashed"
            style={{ borderColor: `${accent}33` }}
          >
            <PlayCircle className="size-6 text-muted-foreground/50" />
            <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground/60">{label}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
