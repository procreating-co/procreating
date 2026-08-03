import type { PresentationContent } from "@/lib/clients/presentation-registry";

/**
 * Template "Presentation" — reutilizável por qualquer cliente com `template: "Presentation"`
 * (ver `lib/clients/workspace-types.ts`). Recebe só dado (`PresentationContent`), nunca importa
 * nada específico de um cliente — é o que faz "mesmo componente, dados diferentes" valer de
 * verdade. Deliberadamente distinto do pipeline `ClientConfig`/`components/landing/**` da
 * Pascoal: identidade visual própria (serif grande, muito espaço, cor de destaque só em
 * detalhes), não video-hero/contadores — produtos diferentes, tratamento diferente.
 */
export function PresentationTemplate({ content }: { content: PresentationContent }) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-[85vh] max-w-[720px] flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mb-8 h-px w-10" style={{ backgroundColor: content.accentColor }} aria-hidden="true" />
        <h1 className="text-balance font-display text-5xl leading-tight text-foreground sm:text-6xl">{content.brandName}</h1>
        <p className="mt-6 max-w-md text-balance text-lg text-muted-foreground">{content.positioning}</p>
        <p className="mt-10 font-mono text-xs uppercase tracking-wide text-muted-foreground/70">{content.heroNote}</p>
      </section>

      <section className="mx-auto max-w-[900px] px-6 pb-32">
        {content.sections.map((section) => (
          <div key={section.key} className="grid grid-cols-1 gap-2 border-t border-border/60 py-10 sm:grid-cols-[200px_1fr] sm:gap-8">
            <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">{section.title}</p>
            <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">{section.body}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-border/60 px-6 py-10 text-center">
        <p className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground/70">
          <span className="size-1 rounded-full" style={{ backgroundColor: content.accentColor }} aria-hidden="true" />
          {content.brandName}
        </p>
      </footer>
    </main>
  );
}
