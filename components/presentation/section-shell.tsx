import type { ReactNode } from "react";

/**
 * Casca compartilhada pelas 6 seções "de prosa" da biblioteca (tudo exceto `HeroSection`, que
 * tem layout de tela cheia próprio, sem essa moldura). Não é um dos blocos nomeados
 * (`*Section.tsx`) — é o utilitário interno que eles usam por baixo, pra não repetir a mesma
 * moldura (eyebrow + heading + largura máxima) em cada arquivo.
 */
export function SectionShell({
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
