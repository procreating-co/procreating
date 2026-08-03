import { ArrowDown, PlayCircle } from "lucide-react";
import type { HeroContent } from "@/lib/clients/presentation-types";

/**
 * Bloco de apresentação — Hero. Recebe `brandName` à parte (não faz parte do `content` de
 * nenhuma seção; é identidade do cliente, `PresentationContent.brandName`). Layout de tela
 * cheia próprio, sem `SectionShell` — nenhuma outra seção da biblioteca tem esse tratamento.
 */
export function HeroSection({ brandName, eyebrow, content, accent }: { brandName: string; eyebrow: string; content: HeroContent; accent: string }) {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center">
      <p className="mb-6 font-mono text-xs uppercase tracking-[0.25em]" style={{ color: accent }}>
        {eyebrow}
      </p>
      <h1 className="text-balance font-display text-5xl leading-[1.05] text-foreground sm:text-7xl">{brandName}</h1>
      <p className="mt-6 max-w-lg text-balance text-lg text-muted-foreground">{content.positioning}</p>

      <div
        className="relative mt-14 flex aspect-video w-full max-w-2xl flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border"
        style={{ borderColor: `${accent}33`, background: `linear-gradient(135deg, ${accent}14, transparent)` }}
      >
        <PlayCircle className="size-10" style={{ color: accent }} />
        <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">{content.mediaLabel}</p>
      </div>

      <a
        href={content.cta.href}
        className="mt-10 inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm transition-colors hover:bg-foreground/5"
        style={{ borderColor: accent, color: accent }}
      >
        {content.cta.label}
        <ArrowDown className="size-4" />
      </a>

      <p className="mt-16 font-mono text-[11px] uppercase tracking-wide text-muted-foreground/60">{content.note}</p>
    </section>
  );
}
