"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { BudgetGroup, BudgetItem, ProposalContent } from "@/lib/clients/proposal-types";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/** Um dígito do odômetro — coluna de 0-9 que desliza verticalmente até o dígito certo ficar visível. */
function OdometerDigit({ digit }: { digit: string }) {
  if (!/[0-9]/.test(digit)) {
    return <span className="inline-block">{digit === " " ? " " : digit}</span>;
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

/** Valor formatado ("R$ 6.200") renderizado dígito a dígito — cada troca de valor rola como um odômetro. */
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

/** Círculo brilhante — aceso (ativo) ou apagado (inativo). Clicável só quando `onToggle` existe. */
function GlowDot({ active, accent, onToggle }: { active: boolean; accent: string; onToggle?: () => void }) {
  const dot = (
    <motion.span
      whileTap={onToggle ? { scale: 0.8 } : undefined}
      className="block size-3 shrink-0 rounded-full transition-all duration-300"
      style={{
        backgroundColor: active ? accent : "transparent",
        border: active ? "none" : "1.5px solid rgba(255,255,255,0.25)",
        boxShadow: active ? `0 0 8px ${accent}, 0 0 2px ${accent}` : "none",
      }}
    />
  );

  if (!onToggle) {
    return (
      <span className="flex items-center" aria-hidden="true">
        {dot}
      </span>
    );
  }

  return (
    <button type="button" onClick={onToggle} aria-pressed={active} className="flex items-center" aria-label="Ativar ou desativar item">
      {dot}
    </button>
  );
}

type State = { toggles: Record<string, boolean>; videoTiers: Record<string, string> };

function initialState(groups: BudgetGroup[]): State {
  const toggles: Record<string, boolean> = {};
  const videoTiers: Record<string, string> = {};
  for (const group of groups) {
    for (const item of group.items) {
      if (item.kind === "toggle") toggles[item.id] = item.defaultOn;
      if (item.kind === "video-tier") videoTiers[item.id] = item.defaultOptionId;
    }
  }
  return { toggles, videoTiers };
}

function computeTotal(groups: BudgetGroup[], state: State): number {
  let total = 0;
  for (const group of groups) {
    for (const item of group.items) {
      if (item.kind === "toggle" && state.toggles[item.id]) total += item.price;
      if (item.kind === "video-tier") {
        const option = item.options.find((candidate) => candidate.id === state.videoTiers[item.id]);
        if (option) total += option.price;
      }
    }
  }
  return total;
}

function BudgetItemRow({ item, state, accent, onToggle, onSelectTier }: { item: BudgetItem; state: State; accent: string; onToggle: (id: string) => void; onSelectTier: (groupId: string, optionId: string) => void }) {
  if (item.kind === "static") {
    return (
      <div className="flex items-center gap-3 py-2">
        <GlowDot active accent={accent} />
        <span className="text-sm text-white/70">{item.label}</span>
      </div>
    );
  }

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
    <>
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
    </>
  );
}

export function ProposalConfigurator({ content, accent }: { content: ProposalContent["configurator"]; accent: string }) {
  const [state, setState] = useState<State>(() => initialState(content.groups));

  const total = useMemo(() => computeTotal(content.groups, state), [content.groups, state]);

  const toggle = (id: string) => setState((current) => ({ ...current, toggles: { ...current.toggles, [id]: !current.toggles[id] } }));
  const selectTier = (groupId: string, optionId: string) => setState((current) => ({ ...current, videoTiers: { ...current.videoTiers, [groupId]: optionId } }));

  return (
    <section id="configurador" className="scroll-mt-20 border-t border-white/10 bg-black px-6 py-24 text-white lg:px-12 lg:py-32">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="font-display text-3xl tracking-tight text-white sm:text-4xl">{content.heading}</h2>
      </div>

      <div className="mx-auto mt-12 max-w-lg">
        <div className="flex flex-col items-center border border-white/15 bg-white/[0.03] px-8 py-12 text-center">
          <span className="font-mono text-xs uppercase tracking-wide text-white/45">Investimento mensal</span>
          <p className="mt-4 font-display text-6xl tabular-nums text-white sm:text-7xl">
            <OdometerValue value={total} />
          </p>
        </div>

        <div className="mt-10 flex flex-col divide-y divide-white/10">
          {content.groups.map((group) => (
            <div key={group.label} className="py-5 first:pt-0">
              <p className="mb-2 font-mono text-xs uppercase tracking-wide text-white/40">{group.label}</p>
              <div className="flex flex-col">
                {group.items.map((item) => (
                  <BudgetItemRow key={item.id} item={item} state={state} accent={accent} onToggle={toggle} onSelectTier={selectTier} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
