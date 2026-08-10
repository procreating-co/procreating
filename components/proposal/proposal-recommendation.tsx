import { ArrowRight, Check } from "lucide-react";
import type { ProposalContent } from "@/lib/clients/proposal-types";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/**
 * Vitrine estática da recomendação — mostra o pacote "8 vídeos/mês + Posicionamento" que já
 * vem selecionado por padrão no configurador (mesmos números, sem estado próprio: se o valor do
 * tier recomendado mudar em content/clients/elenita/proposal.ts, esta seção acompanha
 * automaticamente, sem risco de os dois números divergirem).
 */
export function ProposalRecommendation({
  content,
  recommendedTier,
  includedModuleLabel,
  optionalModuleLabels,
  accent,
}: {
  content: ProposalContent["recommendation"];
  recommendedTier: { count: number; price: number };
  includedModuleLabel: string;
  optionalModuleLabels: string[];
  accent: string;
}) {
  return (
    <section className="bg-black px-6 py-24 text-white lg:px-12 lg:py-32">
      <div className="mx-auto max-w-3xl">
        <div className="border p-10 text-center sm:p-14" style={{ borderColor: accent }}>
          <span className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-wide text-black" style={{ backgroundColor: accent }}>
            {content.eyebrow}
          </span>

          <h2 className="mx-auto max-w-xl text-balance font-display text-3xl leading-tight text-white sm:text-4xl">{content.heading}</h2>

          <p className="mt-8 font-display text-5xl text-white sm:text-6xl">
            {currency.format(recommendedTier.price)}
            <span className="ml-1 font-mono text-lg text-white/40">/mês</span>
          </p>

          <ul className="mx-auto mt-8 flex max-w-sm flex-col gap-2.5 text-left">
            <li className="flex items-center gap-2.5 text-sm text-white/70">
              <Check className="size-3.5 shrink-0" style={{ color: accent }} />
              {recommendedTier.count} vídeos/mês
            </li>
            <li className="flex items-center gap-2.5 text-sm text-white/70">
              <Check className="size-3.5 shrink-0" style={{ color: accent }} />
              {includedModuleLabel} incluído
            </li>
          </ul>

          <p className="mx-auto mt-6 max-w-sm text-balance text-sm leading-relaxed text-white/45">
            Adicione {optionalModuleLabels.join(", ")} no configurador acima conforme a prioridade do momento.
          </p>

          <p className="mt-8 font-mono text-xs uppercase tracking-wide text-white/40">{content.contractNote}</p>

          <a
            href={content.ctaHref}
            className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-sm font-medium text-black transition-transform duration-300 hover:scale-[1.03]"
            style={{ backgroundColor: accent }}
          >
            {content.ctaLabel}
            <ArrowRight className="size-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
