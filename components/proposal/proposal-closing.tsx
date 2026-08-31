import type { ReactNode } from "react";
import type { ProposalContent } from "@/lib/clients/proposal-types";

/**
 * Sem CTA e sem badge de data grande — apresentação ao vivo, não landing page de venda. A
 * continuidade até dezembro de 2026 aparece só aqui, de forma natural, dentro do parágrafo.
 *
 * `action` (opcional) — pedido explícito: o botão "Aceitar proposta" junto do fechamento, não
 * como bloco separado embaixo. Elenita nunca recebe essa prop (`app/clients/[client]/public/
 * proposta/page.tsx` não a passa), então continua exatamente sem CTA, como sempre.
 */
export function ProposalClosing({ content, brandName, action }: { content: ProposalContent["closing"]; brandName: string; action?: ReactNode }) {
  return (
    <section className="border-t border-white/10 bg-black px-6 py-28 text-center text-white lg:px-12 lg:py-36">
      <div className="mx-auto flex max-w-xl flex-col items-center">
        <h2 className="text-balance font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">{content.heading}</h2>
        <p className="mt-6 text-balance text-base leading-relaxed text-white/55 sm:text-lg">{content.paragraph}</p>
        {action && <div className="mt-8">{action}</div>}
        <p className="mt-12 font-mono text-xs uppercase tracking-wide text-white/30">{brandName} × Procreating</p>
      </div>
    </section>
  );
}
