"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Compass, LineChart, Minus, Plus, Video, FileText } from "lucide-react";
import type { ProposalContent } from "@/lib/clients/proposal-types";
import type { BudgetUpsell } from "@/lib/comercial/proposal-content-types";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

const PILLAR_ICONS = [Compass, FileText, LineChart, Video];

/**
 * Orçamento — prioridade design > texto. Sem parágrafos, sem tabela de preços tradicional.
 * 4 blocos, nesta ordem: (A) número grande, (B) 4 cards mínimos, (C) Incluso vs Adicionais,
 * (D) cascata Estratégia → Planejamento → Direção → Execução. Preço único da proposta — a seção
 * de upsell com total variável que existia depois desta foi removida a pedido do cliente (na
 * Elenita — a Elenita nunca preenche `upsell`, então continua sem ele, intocada).
 *
 * `upsell` (opcional, novo, pedido explícito) — contador +/- que soma ao número grande em tempo
 * real, SEM NUNCA mostrar o preço unitário em texto em lugar nenhum: só a contagem e o total.
 * Estado só de exibição (`useState`), não persiste em lugar nenhum — é uma exploração de "e se eu
 * adicionar mais", não uma escolha formal que vira parte do contrato (isso continua acontecendo
 * do jeito de sempre: staff edita o valor final na proposta antes de enviar).
 */
export function ProposalBudget({ content, accent }: { content: ProposalContent["budget"] & { recurrence?: "mensal" | "unico"; upsell?: BudgetUpsell | null }; accent: string }) {
  const [extraUnits, setExtraUnits] = useState(0);
  const upsell = content.upsell;
  const displayedTotal = content.heroNumber + extraUnits * (upsell?.unitPrice ?? 0);
  const isRecurring = content.recurrence !== "unico"; // default mensal — preserva o comportamento original da Elenita, que nunca definia `recurrence`.

  return (
    <section className="border-t border-white/10 bg-black px-6 py-24 text-white lg:px-12 lg:py-32">
      {/* A — hero do orçamento */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto flex max-w-lg flex-col items-center text-center"
      >
        <p className="font-display text-6xl tabular-nums text-white sm:text-7xl">
          {currency.format(displayedTotal)}
          {isRecurring && <span className="ml-1 font-mono text-lg text-white/35">/mês</span>}
        </p>
        <p className="mt-4 font-mono text-xs uppercase tracking-wide" style={{ color: accent }}>
          {content.heroLabel}
        </p>
        <p className="mt-2 text-base text-white/50">{content.heroCaption}</p>

        {upsell && (
          <div className="mt-8 flex flex-col items-center gap-3 border-t border-white/10 pt-8">
            <p className="text-sm text-white/60">{upsell.label}</p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setExtraUnits((n) => Math.max(0, n - 1))}
                disabled={extraUnits === 0}
                aria-label="Diminuir"
                className="flex size-8 items-center justify-center rounded-full border border-white/20 text-white/70 transition-colors hover:border-white/40 hover:text-white disabled:pointer-events-none disabled:opacity-30"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="min-w-6 text-center font-mono text-lg tabular-nums text-white">{extraUnits}</span>
              <button
                type="button"
                onClick={() => setExtraUnits((n) => Math.min(upsell.max, n + 1))}
                disabled={extraUnits >= upsell.max}
                aria-label="Aumentar"
                className="flex size-8 items-center justify-center rounded-full border transition-colors disabled:pointer-events-none disabled:opacity-30"
                style={{ borderColor: accent, color: accent }}
              >
                <Plus className="size-3.5" />
              </button>
            </div>
            {extraUnits > 0 && <p className="font-mono text-[10px] uppercase tracking-wide text-white/30">+{extraUnits} incluído{extraUnits > 1 ? "s" : ""} no valor acima</p>}
          </div>
        )}
      </motion.div>

      {/* B — bloco central: o que sustenta o projeto */}
      <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {content.pillars.map((pillar, index) => {
          const Icon = PILLAR_ICONS[index % PILLAR_ICONS.length];
          return (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
              className="flex flex-col gap-3 border border-white/10 p-5"
            >
              <Icon className="size-4" style={{ color: accent }} />
              <p className="font-display text-base text-white">{pillar.title}</p>
              <div className="flex flex-col gap-1">
                {pillar.items.map((item) => (
                  <p key={item} className="text-xs leading-relaxed text-white/45">
                    {item}
                  </p>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* C — Incluso vs Adicionais */}
      <div className="mx-auto mt-20 grid max-w-4xl grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.5, ease: "easeOut" }}>
          <p className="mb-6 font-mono text-xs uppercase tracking-wide" style={{ color: accent }}>
            {content.includedLabel}
          </p>
          <div className="flex flex-col gap-3">
            {content.includedItems.map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <Check className="size-3.5 shrink-0" style={{ color: accent }} />
                <span className="text-sm text-white/80">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}>
          <p className="mb-6 font-mono text-xs uppercase tracking-wide text-white/35">{content.additionalLabel}</p>
          <div className="flex flex-col gap-3">
            {content.additionalItems.map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <Plus className="size-3.5 shrink-0 text-white/25" />
                <span className="text-sm text-white/40">{item}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 font-mono text-[10px] uppercase tracking-wide text-white/25">Fora da base — contratável à parte</p>
        </motion.div>
      </div>

      {/* D — cascata Estratégia → Planejamento → Direção → Execução */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto mt-20 flex max-w-3xl flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-2"
      >
        {content.flowSteps.map((step, index) => {
          const isBase = index < content.flowSteps.length - 1;
          return (
            <div key={step} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-2 px-3 py-2 text-center">
                <span className="h-1 w-8 rounded-full" style={{ backgroundColor: isBase ? accent : "rgba(255,255,255,0.15)" }} />
                <span className="font-mono text-xs uppercase tracking-wide" style={{ color: isBase ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.4)" }}>
                  {step}
                </span>
              </div>
              {index < content.flowSteps.length - 1 && <ArrowRight className="size-3.5 shrink-0 text-white/15" />}
            </div>
          );
        })}
      </motion.div>
    </section>
  );
}
