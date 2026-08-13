"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, MessageCircle } from "lucide-react";
import { ProposalPascoalSectionTexture } from "@/components/proposal-pascoal/proposal-pascoal-section-texture";
import type { PascoalProposalContent } from "@/lib/pascoal-proposal/types";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

function buildWhatsAppMessage(content: PascoalProposalContent): string {
  const { investment, whatsapp } = content;
  return [
    `Olá, ${whatsapp.ceoFirstName}! Estou entrando em contato através da proposta da Pascoal Bombas e gostaria de fechar a estrutura apresentada.`,
    "",
    "Estrutura: Pascoal Bombas Zona Sul, Pascoal Bombas Zona Norte e o perfil pessoal da Julia, começando pelo mês de teste.",
    `Valor: ${currency.format(investment.finalPrice)}/mês.`,
    "",
    "Gostaria de avançar com essa estrutura.",
  ].join("\n");
}

/**
 * Ancoragem de preço, sem interatividade. R$3.500/perfil (contexto) então R$10.500 riscado
 * (referência de comparação, nunca preço a pagar) então R$7.500 em destaque (o valor real).
 */
export function ProposalPascoalInvestment({ content, accent }: { content: PascoalProposalContent; accent: string }) {
  const { investment, cta, whatsapp } = content;
  const [ctaState, setCtaState] = useState<"idle" | "confirming">("idle");

  const handleCta = () => {
    if (ctaState === "confirming") return;
    setCtaState("confirming");
    const message = buildWhatsAppMessage(content);
    window.setTimeout(() => {
      window.open(`https://wa.me/${whatsapp.phoneDigits}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
      setCtaState("idle");
    }, 700);
  };

  return (
    <section className="relative overflow-hidden border-t border-white/10 bg-black px-6 py-24 text-white lg:px-12 lg:py-32">
      <ProposalPascoalSectionTexture accent={accent} corner="top-right" />

      <div className="relative mx-auto max-w-xl">
        <h2 className="text-balance text-center font-display text-3xl leading-[1.05] tracking-tight text-white sm:text-4xl">{investment.heading}</h2>
        <p className="mx-auto mt-3 max-w-sm text-balance text-center text-sm leading-relaxed text-white/55">{investment.coverageNote}</p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative mt-10 overflow-hidden border border-white/15 px-6 py-12 text-center sm:px-10"
          style={{ background: `radial-gradient(ellipse 120% 100% at 50% 0%, ${accent}12, transparent 60%), rgba(255,255,255,0.02)` }}
        >
          <p className="font-mono text-xs uppercase tracking-wide text-white/40">{investment.perfilLabel}</p>
          <p className="mt-1.5 text-sm text-white/55">{currency.format(investment.perfilPrice)}/mês</p>

          <div className="mt-6 flex flex-col items-center gap-1">
            <p className="font-mono text-[11px] uppercase tracking-wide text-white/30">{investment.referenceLabel}</p>
            <p className="text-base text-white/30 line-through decoration-white/30">{currency.format(investment.referencePrice)}/mês</p>
          </div>

          <div className="mt-8 border-t border-white/10 pt-8">
            <p className="flex items-baseline justify-center gap-2 font-display text-5xl tabular-nums text-white sm:text-6xl">
              {currency.format(investment.finalPrice)}
              <span className="font-mono text-base font-normal text-white/40">/mês</span>
            </p>
            <p className="mx-auto mt-4 max-w-xs text-balance text-sm leading-relaxed text-white/55">{investment.reinforcement}</p>
          </div>
        </motion.div>

        <p className="mx-auto mt-6 max-w-md text-balance text-center text-xs leading-relaxed text-white/35">{investment.note}</p>

        <div className="mt-10 flex flex-col items-center">
          <button
            type="button"
            onClick={handleCta}
            disabled={ctaState === "confirming"}
            className="inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-medium text-black transition-all duration-300 hover:scale-[1.03] disabled:opacity-80"
            style={{ backgroundColor: accent }}
          >
            {ctaState === "confirming" ? (
              <>
                <Check className="size-4" /> Confirmado, abrindo WhatsApp
              </>
            ) : (
              <>
                <MessageCircle className="size-4" /> {cta.label}
              </>
            )}
          </button>
          <p className="mt-4 text-xs text-white/35">{cta.note}</p>
        </div>
      </div>
    </section>
  );
}
