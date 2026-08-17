"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { ProposalSectionHeader } from "@/components/proposal/proposal-section-header";
import type { ProposalContent } from "@/lib/clients/proposal-types";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/**
 * Total exibido no card "Investimento total" — FIXO por decisão de negócio, não
 * `basePrice + soma dos itens selecionados`. Os itens continuam togglável (é apresentação ao
 * vivo, o vendedor pode desmarcar durante a conversa) e o preço de cada item não aparece em
 * lugar nenhum da seção — só esse número final. Pra mudar o total, edite esta constante.
 */
const FIXED_TOTAL = 6000;

/** Um dígito do odômetro — coluna de 0-9 que desliza verticalmente até o dígito certo ficar visível. */
function OdometerDigit({ digit }: { digit: string }) {
  if (!/[0-9]/.test(digit)) return <span className="inline-block">{digit}</span>;
  const value = Number(digit);
  return (
    <span className="relative inline-block h-[1em] w-[0.62em] overflow-hidden align-bottom">
      <motion.span className="absolute inset-x-0 top-0 flex flex-col items-center" initial={false} animate={{ y: `-${value}em` }} transition={{ type: "spring", stiffness: 260, damping: 28 }}>
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="block h-[1em] leading-[1em]">
            {i}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

function OdometerValue({ value }: { value: number }) {
  const formatted = currency.format(value);
  return (
    <span className="inline-flex">
      {formatted.split("").map((char, index) => (
        <OdometerDigit key={index} digit={char} />
      ))}
    </span>
  );
}

/**
 * Upsell — itens de reforço apresentados já marcados (padrão pra apresentação ao vivo: a
 * conversa parte de "isso está incluso", não de "quer adicionar?"), mas continuam togglável —
 * o vendedor pode desmarcar durante a conversa. Preço por item não é exibido em lugar nenhum;
 * o card "Investimento total" mostra sempre `FIXED_TOTAL`, independente da seleção.
 * `basePrice` (base estratégica, proposal-budget.tsx) é recebido só por compatibilidade com o
 * caller — não participa mais do total exibido aqui.
 */
export function ProposalUpsell({ content, accent }: { content: ProposalContent["upsell"]; basePrice: number; accent: string }) {
  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(content.items.map((item) => [item.id, true])),
  );

  const toggle = (id: string) => setSelected((current) => ({ ...current, [id]: !current[id] }));

  return (
    <section className="border-t border-white/10 bg-black px-6 py-24 text-white lg:px-12 lg:py-32">
      <div className="mx-auto max-w-2xl text-center">
        <ProposalSectionHeader eyebrow="" heading={content.heading} align="center" accent={accent} />
        <p className="mx-auto mt-5 max-w-md text-balance text-base leading-relaxed text-white/55">{content.subtitle}</p>
      </div>

      <div className="mx-auto mt-14 max-w-xl">
        <div className="flex flex-col gap-3">
          {content.items.map((item) => {
            const active = Boolean(selected[item.id]);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggle(item.id)}
                aria-pressed={active}
                className="flex items-start gap-3.5 border px-5 py-4 text-left transition-all duration-300"
                style={{ borderColor: active ? accent : "rgba(255,255,255,0.12)", backgroundColor: active ? `${accent}0f` : "transparent" }}
              >
                <span
                  className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300"
                  style={{ borderColor: active ? accent : "rgba(255,255,255,0.25)", backgroundColor: active ? accent : "transparent" }}
                >
                  {active && <Check className="size-3 text-black" />}
                </span>
                <div>
                  <p className="font-display text-lg text-white">{item.label}</p>
                  <p className="mt-0.5 text-sm text-white/50">{item.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col items-center border border-white/15 bg-white/[0.03] px-8 py-8 text-center">
          <span className="font-mono text-xs uppercase tracking-wide text-white/45">Investimento total</span>
          <p className="mt-3 font-display text-4xl tabular-nums text-white sm:text-5xl">
            <OdometerValue value={FIXED_TOTAL} />
          </p>
        </div>
      </div>
    </section>
  );
}
