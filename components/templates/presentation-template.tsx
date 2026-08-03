import type { ReactNode } from "react";
import { ArrowDown, Image as ImageIcon, PlayCircle } from "lucide-react";
import type { PresentationContent, PresentationSection } from "@/lib/clients/presentation-registry";

/**
 * Template "Presentation" — reutilizável por qualquer cliente com `template: "Presentation"`
 * (ver `lib/clients/workspace-types.ts`). Renderiza `content.sections` dinamicamente: a lista
 * (quais seções existem, em que ordem, habilitadas ou não) vem inteiramente de
 * `content/clients/<slug>/public.ts` — nenhuma seção é hardcoded na estrutura da página. Um
 * cliente novo com um conjunto de seções diferente (`services`, `portfolio`, `testimonials`,
 * `contact`...) só precisa de: 1) um novo `type` em `PresentationSectionType`
 * (`lib/clients/presentation-types.ts`), 2) um `case` novo em `renderSection` abaixo, 3) o
 * `content` do cliente usando esse tipo — nunca uma página nova.
 *
 * Todo placeholder de mídia é rotulado como reservado — nunca finge uma foto/vídeo real que não
 * existe.
 */
export function PresentationTemplate({ content }: { content: PresentationContent }) {
  const accent = content.accentColor;

  return (
    <main className="min-h-screen bg-background text-foreground">
      {content.sections
        .filter((section) => section.enabled)
        .map((section) => renderSection(section, content, accent))}

      <footer className="border-t border-border/60 px-6 py-10 text-center">
        <p className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground/70">
          <span className="size-1 rounded-full" style={{ backgroundColor: accent }} />
          {content.brandName}
        </p>
      </footer>
    </main>
  );
}

/**
 * Dispatch por `section.type` — um `switch` (não uma tabela de lookup) de propósito: dentro de
 * cada `case`, o TypeScript estreita `section.content` pro shape certo daquele tipo sozinho,
 * sem precisar de nenhum type assertion manual. Adicionar um `type` novo sem um `case`
 * correspondente aqui é erro de compilação (`never` no fim), não um bug silencioso em produção.
 */
function renderSection(section: PresentationSection, content: PresentationContent, accent: string): ReactNode {
  switch (section.type) {
    case "hero":
      return (
        <section key={section.id} className="relative flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center">
          <p className="mb-6 font-mono text-xs uppercase tracking-[0.25em]" style={{ color: accent }}>
            {section.title}
          </p>
          <h1 className="text-balance font-display text-5xl leading-[1.05] text-foreground sm:text-7xl">{content.brandName}</h1>
          <p className="mt-6 max-w-lg text-balance text-lg text-muted-foreground">{section.content.positioning}</p>

          <div
            className="relative mt-14 flex aspect-video w-full max-w-2xl flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border"
            style={{ borderColor: `${accent}33`, background: `linear-gradient(135deg, ${accent}14, transparent)` }}
          >
            <PlayCircle className="size-10" style={{ color: accent }} />
            <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">{section.content.mediaLabel}</p>
          </div>

          <a
            href={section.content.cta.href}
            className="mt-10 inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm transition-colors hover:bg-foreground/5"
            style={{ borderColor: accent, color: accent }}
          >
            {section.content.cta.label}
            <ArrowDown className="size-4" />
          </a>

          <p className="mt-16 font-mono text-[11px] uppercase tracking-wide text-muted-foreground/60">{section.content.note}</p>
        </section>
      );

    case "about":
      return (
        <SectionShell key={section.id} id={section.id} accent={accent} eyebrow={section.title} heading={section.content.heading} narrow>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground">{section.content.body}</p>
        </SectionShell>
      );

    case "project":
      return (
        <SectionShell key={section.id} id={section.id} accent={accent} eyebrow={section.title} heading={section.content.heading}>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">{section.content.body}</p>
          <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {section.content.pillars.map((pillar) => (
              <li key={pillar} className="rounded-xl border border-border/60 p-5 text-sm text-foreground">
                <span className="mb-3 block size-1.5 rounded-full" style={{ backgroundColor: accent }} />
                {pillar}
              </li>
            ))}
          </ul>
        </SectionShell>
      );

    case "content":
      return (
        <SectionShell key={section.id} id={section.id} accent={accent} eyebrow={section.title} heading={section.content.heading}>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">{section.content.body}</p>
          <div className="mt-8 flex flex-wrap gap-2">
            {section.content.tags.map((tag) => (
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

    case "gallery":
      return (
        <SectionShell key={section.id} id={section.id} accent={accent} eyebrow={section.title} heading={section.content.heading} wide>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">{section.content.body}</p>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {section.content.placeholders.map((label) => (
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

    case "videos":
      return (
        <SectionShell key={section.id} id={section.id} accent={accent} eyebrow={section.title} heading={section.content.heading}>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">{section.content.body}</p>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {section.content.placeholders.map((label) => (
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

    case "strategy":
      return (
        <SectionShell key={section.id} id={section.id} accent={accent} eyebrow={section.title} heading={section.content.heading}>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">{section.content.body}</p>
          <ol className="mt-10 flex flex-col gap-6">
            {section.content.steps.map((step, index) => (
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

    default: {
      const _exhaustive: never = section;
      return _exhaustive;
    }
  }
}

/** Casca compartilhada pelas 6 seções "de prosa" (tudo exceto Hero, que tem layout próprio). */
function SectionShell({
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
