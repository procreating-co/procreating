import type { ReactNode } from "react";
import { ArrowDown, Image as ImageIcon, PlayCircle } from "lucide-react";
import type { PresentationContent } from "@/lib/clients/presentation-registry";

/**
 * Template "Presentation" — reutilizável por qualquer cliente com `template: "Presentation"`
 * (ver `lib/clients/workspace-types.ts`). Recebe só dado (`PresentationContent`), nunca importa
 * nada específico de um cliente. Cada seção tem tratamento visual distinto de propósito (prosa /
 * pilares / tags / grade de mídia / roteiro numerado) — o oposto de repetir o mesmo bloco 7
 * vezes, que é exatamente o que faria isto parecer uma landing page genérica.
 *
 * Todo placeholder de mídia (galeria, vídeos, hero) é rotulado como reservado — nunca finge uma
 * foto/vídeo real que não existe.
 */
export function PresentationTemplate({ content }: { content: PresentationContent }) {
  const accent = content.accentColor;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center">
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.25em]" style={{ color: accent }}>
          {content.hero.eyebrow}
        </p>
        <h1 className="text-balance font-display text-5xl leading-[1.05] text-foreground sm:text-7xl">{content.brandName}</h1>
        <p className="mt-6 max-w-lg text-balance text-lg text-muted-foreground">{content.hero.positioning}</p>

        <div
          className="relative mt-14 flex aspect-video w-full max-w-2xl flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border"
          style={{ borderColor: `${accent}33`, background: `linear-gradient(135deg, ${accent}14, transparent)` }}
        >
          <PlayCircle className="size-10" style={{ color: accent }} />
          <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">{content.hero.mediaLabel}</p>
        </div>

        <a
          href={content.hero.cta.href}
          className="mt-10 inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm transition-colors hover:bg-foreground/5"
          style={{ borderColor: accent, color: accent }}
        >
          {content.hero.cta.label}
          <ArrowDown className="size-4" />
        </a>

        <p className="mt-16 font-mono text-[11px] uppercase tracking-wide text-muted-foreground/60">{content.hero.note}</p>
      </section>

      <Section id="sobre" accent={accent} eyebrow={content.sobre.eyebrow} heading={content.sobre.heading} narrow>
        <p className="mt-6 text-base leading-relaxed text-muted-foreground">{content.sobre.body}</p>
      </Section>

      <Section id="projeto" accent={accent} eyebrow={content.projeto.eyebrow} heading={content.projeto.heading}>
        <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">{content.projeto.body}</p>
        <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {content.projeto.pillars.map((pillar) => (
            <li key={pillar} className="rounded-xl border border-border/60 p-5 text-sm text-foreground">
              <span className="mb-3 block size-1.5 rounded-full" style={{ backgroundColor: accent }} />
              {pillar}
            </li>
          ))}
        </ul>
      </Section>

      <Section id="conteudos" accent={accent} eyebrow={content.conteudos.eyebrow} heading={content.conteudos.heading}>
        <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">{content.conteudos.body}</p>
        <div className="mt-8 flex flex-wrap gap-2">
          {content.conteudos.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-wide"
              style={{ borderColor: `${accent}44`, color: accent }}
            >
              {tag}
            </span>
          ))}
        </div>
      </Section>

      <Section id="galeria" accent={accent} eyebrow={content.galeria.eyebrow} heading={content.galeria.heading} wide>
        <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">{content.galeria.body}</p>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {content.galeria.placeholders.map((label) => (
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
      </Section>

      <Section id="videos" accent={accent} eyebrow={content.videos.eyebrow} heading={content.videos.heading}>
        <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">{content.videos.body}</p>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {content.videos.placeholders.map((label) => (
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
      </Section>

      <Section id="estrategia" accent={accent} eyebrow={content.estrategia.eyebrow} heading={content.estrategia.heading}>
        <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">{content.estrategia.body}</p>
        <ol className="mt-10 flex flex-col gap-6">
          {content.estrategia.steps.map((step, index) => (
            <li key={step.title} className="flex gap-5">
              <span className="font-mono text-sm tabular-nums text-muted-foreground/60">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p className="font-display text-lg text-foreground">{step.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <footer className="border-t border-border/60 px-6 py-10 text-center">
        <p className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground/70">
          <span className="size-1 rounded-full" style={{ backgroundColor: accent }} />
          {content.brandName}
        </p>
      </footer>
    </main>
  );
}

function Section({
  id,
  accent,
  eyebrow,
  heading,
  narrow,
  wide,
  children,
}: {
  id: string;
  accent: string;
  eyebrow: string;
  heading: string;
  narrow?: boolean;
  wide?: boolean;
  children: ReactNode;
}) {
  const maxWidth = narrow ? "max-w-[640px]" : wide ? "max-w-[1100px]" : "max-w-[900px]";
  return (
    <section id={id} className="scroll-mt-10 border-t border-border/60 px-6 py-28">
      <div className={`mx-auto ${maxWidth}`}>
        <p className="font-mono text-xs uppercase tracking-wide" style={{ color: accent }}>
          {eyebrow}
        </p>
        <h2 className="mt-3 max-w-lg text-balance font-display text-3xl text-foreground sm:text-4xl">{heading}</h2>
        {children}
      </div>
    </section>
  );
}
