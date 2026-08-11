"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FixedBudgetItem, VariableBudgetItem, PascoalProposalContent } from "@/lib/pascoal-proposal/types";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/** Um dígito do odômetro — coluna de 0-9 que desliza verticalmente até o dígito certo ficar visível. */
function OdometerDigit({ digit }: { digit: string }) {
  if (!/[0-9]/.test(digit)) {
    return <span className="inline-block">{digit}</span>;
  }
  const value = Number(digit);
  return (
    <span className="relative inline-block h-[1em] w-[0.62em] overflow-hidden align-bottom">
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col items-center"
        initial={false}
        animate={{ y: `-${value}em` }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="block h-[1em] leading-[1em]">
            {i}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

/** Valor formatado ("R$ 3.500") renderizado dígito a dígito — cada troca de valor rola como um odômetro. */
function OdometerValue({ value }: { value: number }) {
  const formatted = currencyFormatter.format(value);
  return (
    <span className="inline-flex">
      {formatted.split("").map((char, index) => (
        <OdometerDigit key={index} digit={char} />
      ))}
    </span>
  );
}

/** Item fixo — indicador discreto, nunca clicável, nunca brilha. */
function FixedRow({ item }: { item: FixedBudgetItem }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="size-1 shrink-0 rounded-full bg-white/40" aria-hidden="true" />
      <span className="text-sm text-white/80">{item.label}</span>
    </div>
  );
}

/** Círculo brilhante — aceso (ativo, clicável) ou apagado (inativo). */
function GlowDot({ active, accent, onToggle }: { active: boolean; accent: string; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} aria-pressed={active} className="flex items-center" aria-label="Ativar ou desativar item">
      <motion.span
        whileTap={{ scale: 0.8 }}
        className="block size-3 shrink-0 rounded-full transition-all duration-300"
        style={{
          backgroundColor: active ? accent : "transparent",
          border: active ? "none" : "1.5px solid rgba(255,255,255,0.25)",
          boxShadow: active ? `0 0 8px ${accent}, 0 0 2px ${accent}` : "none",
        }}
      />
    </button>
  );
}

type State = { toggles: Record<string, boolean>; videoTiers: Record<string, string> };

function initialState(items: VariableBudgetItem[]): State {
  const toggles: Record<string, boolean> = {};
  const videoTiers: Record<string, string> = {};
  for (const item of items) {
    if (item.kind === "toggle") toggles[item.id] = item.defaultOn;
    if (item.kind === "video-tier") videoTiers[item.id] = item.defaultOptionId;
  }
  return { toggles, videoTiers };
}

/** `video-tier` com `unlockedBy` só soma no total quando o toggle que o desbloqueia está ativo. */
function isUnlocked(item: VariableBudgetItem, state: State): boolean {
  if (item.kind !== "video-tier" || !item.unlockedBy) return true;
  return Boolean(state.toggles[item.unlockedBy]);
}

function computeTotal(fixedPrice: number, items: VariableBudgetItem[], state: State): number {
  let total = fixedPrice;
  for (const item of items) {
    if (!isUnlocked(item, state)) continue;
    if (item.kind === "toggle" && state.toggles[item.id]) total += item.price;
    if (item.kind === "video-tier") {
      const option = item.options.find((candidate) => candidate.id === state.videoTiers[item.id]);
      if (option) total += option.price;
    }
  }
  return total;
}

function VariableRow({ item, state, accent, onToggle, onSelectTier }: { item: VariableBudgetItem; state: State; accent: string; onToggle: (id: string) => void; onSelectTier: (groupId: string, optionId: string) => void }) {
  if (item.kind === "toggle") {
    const active = state.toggles[item.id];
    return (
      <div className="flex items-center gap-3 py-2">
        <GlowDot active={active} accent={accent} onToggle={() => onToggle(item.id)} />
        <button type="button" onClick={() => onToggle(item.id)} className="text-left text-sm transition-colors duration-300" style={{ color: active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)" }}>
          {item.label}
        </button>
      </div>
    );
  }

  const selectedId = state.videoTiers[item.id];
  return (
    <div className="flex flex-col">
      {item.label && <p className="mb-1.5 mt-3 font-mono text-[11px] uppercase tracking-wide text-white/35">{item.label}</p>}
      {item.options.map((option) => {
        const active = option.id === selectedId;
        return (
          <div key={option.id} className="flex items-center gap-3 py-2">
            <GlowDot active={active} accent={accent} onToggle={() => onSelectTier(item.id, option.id)} />
            <button
              type="button"
              onClick={() => onSelectTier(item.id, option.id)}
              className="text-left text-sm transition-colors duration-300"
              style={{ color: active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)" }}
            >
              {option.label}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function ProposalPascoalConfigurator({ content, accent }: { content: PascoalProposalContent["configurator"]; accent: string }) {
  const [state, setState] = useState<State>(() => initialState(content.variableItems));

  const total = useMemo(() => computeTotal(content.fixedPrice, content.variableItems, state), [content.fixedPrice, content.variableItems, state]);

  const toggle = (id: string) => setState((current) => ({ ...current, toggles: { ...current.toggles, [id]: !current.toggles[id] } }));
  const selectTier = (groupId: string, optionId: string) => setState((current) => ({ ...current, videoTiers: { ...current.videoTiers, [groupId]: optionId } }));

  return (
    <section id="configurador" className="scroll-mt-20 border-t border-white/10 bg-black px-6 py-24 text-white lg:px-12 lg:py-32">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col items-center border border-white/15 bg-white/[0.03] px-8 py-12 text-center">
          <span className="font-mono text-xs uppercase tracking-wide text-white/45">Investimento mensal</span>
          <p className="mt-4 font-display text-6xl tabular-nums text-white sm:text-7xl">
            <OdometerValue value={total} />
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-14">
          <div className="border-t border-white/10 pt-8 md:border-t-0 md:border-r md:pr-14 md:pt-0">
            <p className="mb-1 font-mono text-xs uppercase tracking-wide text-white/45">{content.fixedLabel}</p>
            <p className="mb-5 text-xs text-white/30">Sempre inclusos</p>
            <div className="flex flex-col">
              {content.fixedItems.map((item) => (
                <FixedRow key={item.id} item={item} />
              ))}
            </div>
          </div>

          <div className="pt-2 md:pt-0">
            <p className="mb-1 font-mono text-xs uppercase tracking-wide text-white/45">{content.variableLabel}</p>
            <p className="mb-5 text-xs text-white/30">Ajuste conforme a prioridade</p>
            <div className="flex flex-col">
              {content.variableItems.map((item) => {
                const unlocked = isUnlocked(item, state);
                return (
                  <AnimatePresence key={item.id} initial={false}>
                    {unlocked && (
                      <motion.div
                        initial={item.kind === "video-tier" ? { height: 0, opacity: 0 } : false}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <VariableRow item={item} state={state} accent={accent} onToggle={toggle} onSelectTier={selectTier} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
