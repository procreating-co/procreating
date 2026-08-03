import type { ReactNode } from "react";
import type { PresentationContent, PresentationSection } from "@/lib/clients/presentation-registry";
import { HeroSection } from "@/components/presentation/hero-section";
import { AboutSection } from "@/components/presentation/about-section";
import { ProjectSection } from "@/components/presentation/project-section";
import { ContentSection } from "@/components/presentation/content-section";
import { GallerySection } from "@/components/presentation/gallery-section";
import { VideoSection } from "@/components/presentation/video-section";
import { StrategySection } from "@/components/presentation/strategy-section";

/**
 * Template "Presentation" — reutilizável por qualquer cliente com `template: "Presentation"`
 * (ver `lib/clients/workspace-types.ts`). Renderiza `content.sections` dinamicamente: a lista
 * (quais seções existem, em que ordem, habilitadas ou não) vem inteiramente de
 * `content/clients/<slug>/public.ts`. Este arquivo não tem nenhum JSX de seção próprio — só
 * decide QUAL bloco da biblioteca (`components/presentation/*Section.tsx`) renderizar pra cada
 * `section.type`. Um cliente novo com um conjunto de seções diferente (`services`, `portfolio`,
 * `testimonials`, `contact`...) precisa de: 1) um novo `type` em `PresentationSectionType`
 * (`lib/clients/presentation-types.ts`), 2) o bloco correspondente em `components/presentation/`,
 * 3) um `case` novo em `renderSection` abaixo, 4) o `content` do cliente usando esse tipo —
 * nunca uma página nova.
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
 * cada `case`, o TypeScript estreita `section.content` pro shape certo daquele tipo sozinho, sem
 * precisar de nenhum type assertion manual. Adicionar um `type` novo sem um `case`
 * correspondente aqui é erro de compilação (`never` no fim), não um bug silencioso em produção.
 */
function renderSection(section: PresentationSection, content: PresentationContent, accent: string): ReactNode {
  switch (section.type) {
    case "hero":
      return <HeroSection key={section.id} brandName={content.brandName} eyebrow={section.title} content={section.content} accent={accent} />;

    case "about":
      return <AboutSection key={section.id} id={section.id} eyebrow={section.title} content={section.content} accent={accent} />;

    case "project":
      return <ProjectSection key={section.id} id={section.id} eyebrow={section.title} content={section.content} accent={accent} />;

    case "content":
      return <ContentSection key={section.id} id={section.id} eyebrow={section.title} content={section.content} accent={accent} />;

    case "gallery":
      return <GallerySection key={section.id} id={section.id} eyebrow={section.title} content={section.content} accent={accent} />;

    case "videos":
      return <VideoSection key={section.id} id={section.id} eyebrow={section.title} content={section.content} accent={accent} />;

    case "strategy":
      return <StrategySection key={section.id} id={section.id} eyebrow={section.title} content={section.content} accent={accent} />;

    default: {
      const _exhaustive: never = section;
      return _exhaustive;
    }
  }
}
