"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { PascoalProposalContent, ProfileCount, VideoCount } from "@/lib/pascoal-proposal/types";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/** Um dígito do odômetro — coluna de 0-9 que desliza verticalmente até o dígito certo ficar visível. */
function OdometerDigit({ digit }: { digit: string }) {
  if (!/[0-9]/.test(digit)) return <span className="inline-block">{digit}</span>;
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

/** Valor formatado renderizado dígito a dígito — cada troca de valor rola como um odômetro. `null` = ainda sem preço definido, mostra texto em vez de inventar um número. */
function TotalValue({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-4xl sm:text-5xl">Valor a definir</span>;
  }
  const formatted = currency.format(value);
  return (
    <span className="inline-flex">
      {formatted.split("").map((char, index) => (
        <OdometerDigit key={index} digit={char} />
      ))}
    </span>
  );
}

/** Círculo brilhante — aceso (ativo, clicável) ou apagado (inativo). Mesmo padrão já usado no restante da proposta. */
function GlowDot({ active, accent, onToggle, label }: { active: boolean; accent: string; onToggle: () => void; label: string }) {
  return (
    <button type="button" onClick={onToggle} aria-pressed={active} className="flex shrink-0 items-center" aria-label={label}>
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

function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">{label}</span>
      <div className="text-sm text-white/80">{children}</div>
    </div>
  );
}

type State = {
  contentActive: boolean;
  profiles: ProfileCount;
  videos: VideoCount;
  growthOpen: boolean;
  toggles: Record<string, boolean>;
};

function getContentPrice(prices: PascoalProposalContent["configurator"]["content"]["prices"], profiles: ProfileCount, videos: VideoCount): number | null {
  return prices.find((p) => p.profiles === profiles && p.videos === videos)?.price ?? null;
}

export function ProposalPascoalConfigurator({ content, accent }: { content: PascoalProposalContent["configurator"]; accent: string }) {
  const [state, setState] = useState<State>({ contentActive: false, profiles: 1, videos: 4, growthOpen: false, toggles: {} });

  const contentPrice = getContentPrice(content.content.prices, state.profiles, state.videos);
  const base = state.contentActive ? contentPrice : content.planInitial.price;
  const growthTotal = content.growth.toggles.reduce((sum, t) => sum + (state.toggles[t.id] ? t.price : 0), 0);
  const total = useMemo(() => (base === null ? null : base + growthTotal), [base, growthTotal]);

  const activeGrowthLabels = content.growth.toggles.filter((t) => state.toggles[t.id]).map((t) => t.label);

  const toggleContent = () => setState((current) => ({ ...current, contentActive: !current.contentActive }));
  const selectProfiles = (profiles: ProfileCount) => setState((current) => ({ ...current, profiles }));
  const selectVideos = (videos: VideoCount) => setState((current) => ({ ...current, videos }));
  const toggleGrowthOpen = () => setState((current) => ({ ...current, growthOpen: !current.growthOpen }));
  const toggleGrowthItem = (id: string) => setState((current) => ({ ...current, toggles: { ...current.toggles, [id]: !current.toggles[id] } }));

  return (
    <section id="configurador" className="scroll-mt-20 border-t border-white/10 bg-black px-6 py-24 text-white lg:px-12 lg:py-32">
      <div className="mx-auto max-w-3xl">
        {/* Investimento mensal + resumo dinâmico — o valor grande é sempre a âncora visual */}
        <div className="flex flex-col items-center border border-white/15 bg-white/[0.03] px-6 py-12 text-center sm:px-10">
          <span className="font-mono text-xs uppercase tracking-wide text-white/45">Investimento mensal</span>
          <p className="mt-4 font-display text-5xl tabular-nums text-white sm:text-7xl">
            <TotalValue value={total} />
          </p>
          {total !== null && <span className="mt-2 font-mono text-xs uppercase tracking-wide text-white/35">por mês</span>}

          <div className="mt-10 w-full max-w-sm divide-y divide-white/10 border-t border-white/10 text-left">
            <SummaryRow label="Plano inicial">{content.planInitial.includedItem}</SummaryRow>

            <AnimatePresence initial={false}>
              {state.contentActive && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
                  <SummaryRow label="Posicionamento">
                    <div className="flex flex-col sm:items-end">
                      <span>
                        {state.profiles.toString().padStart(2, "0")} perfis × {state.videos.toString().padStart(2, "0")} vídeos por perfil
                      </span>
                      <span className="text-white/50">{(state.profiles * state.videos).toString().padStart(2, "0")} vídeos/mês</span>
                    </div>
                  </SummaryRow>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence initial={false}>
              {activeGrowthLabels.length > 0 && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
                  <SummaryRow label="Aquisição">
                    <div className="flex flex-col sm:items-end">
                      {activeGrowthLabels.map((label) => (
                        <span key={label}>{label}</span>
                      ))}
                    </div>
                  </SummaryRow>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Plano Inicial — fundação, sempre inclusa, não clicável, preço visível */}
        <div className="mt-12 flex items-center justify-between gap-4 border border-white/10 bg-white/[0.02] px-5 py-4 sm:px-6 sm:py-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-white/45">{content.planInitial.label}</p>
            <div className="mt-2 flex items-center gap-2.5">
              <span className="size-1 shrink-0 rounded-full bg-white/40" aria-hidden="true" />
              <span className="text-sm text-white/80">{content.planInitial.includedItem}</span>
            </div>
            <p className="mt-1 text-xs text-white/30">{content.planInitial.includedLabel}</p>
          </div>
          <span className="shrink-0 font-display text-2xl text-white sm:text-3xl">{currency.format(content.planInitial.price)}</span>
        </div>

        {/* O que pode adicionar */}
        <div className="mt-16">
          <p className="font-mono text-xs uppercase tracking-wide text-white/45">{content.additionsLabel}</p>
          <p className="mt-1 text-xs text-white/30">{content.additionsSubtitle}</p>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Módulo Posicionamento — GlowDot ativa/desativa o plano de conteúdo e substitui o valor-base */}
            <div className="border transition-colors duration-300" style={{ borderColor: state.contentActive ? accent : "rgba(255,255,255,0.1)" }}>
              <button type="button" onClick={toggleContent} aria-pressed={state.contentActive} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6">
                <div className="flex items-center gap-3.5">
                  <GlowDot active={state.contentActive} accent={accent} onToggle={toggleContent} label={`Ativar ${content.content.moduleLabel}`} />
                  <div>
                    <p className="text-sm" style={{ color: state.contentActive ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.6)" }}>
                      {content.content.moduleLabel}
                    </p>
                    <p className="mt-0.5 text-xs text-white/35">{content.content.triggerLabel}</p>
                  </div>
                </div>
                <ChevronDown className={`size-4 shrink-0 text-white/30 transition-transform duration-300 ${state.contentActive ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence initial={false}>
                {state.contentActive && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: "easeInOut" }} className="overflow-hidden">
                    <div className="border-t border-white/10 px-5 py-5 sm:px-6">
                      <p className="mb-2.5 font-mono text-[10px] uppercase tracking-wide text-white/35">Número de perfis</p>
                      <div className="grid grid-cols-3 gap-2">
                        {content.content.profileOptions.map((option) => {
                          const isSelected = option.value === state.profiles;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => selectProfiles(option.value)}
                              aria-pressed={isSelected}
                              className="rounded-md border py-2.5 text-center text-xs font-medium transition-all duration-200"
                              style={{
                                borderColor: isSelected ? accent : "rgba(255,255,255,0.12)",
                                backgroundColor: isSelected ? accent : "transparent",
                                color: isSelected ? "black" : "rgba(255,255,255,0.55)",
                              }}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>

                      <p className="mb-2.5 mt-5 font-mono text-[10px] uppercase tracking-wide text-white/35">Vídeos mensais por perfil</p>
                      <div className="grid grid-cols-2 gap-2">
                        {content.content.videoOptions.map((option) => {
                          const isSelected = option.value === state.videos;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => selectVideos(option.value)}
                              aria-pressed={isSelected}
                              className="rounded-md border py-2.5 text-center text-xs font-medium transition-all duration-200"
                              style={{
                                borderColor: isSelected ? accent : "rgba(255,255,255,0.12)",
                                backgroundColor: isSelected ? accent : "transparent",
                                color: isSelected ? "black" : "rgba(255,255,255,0.55)",
                              }}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-4 border-t border-white/10 pt-4">
                        <p className="text-xs text-white/60">
                          {state.profiles.toString().padStart(2, "0")} perfis × {state.videos.toString().padStart(2, "0")} vídeos por perfil
                        </p>
                        <p className="mt-0.5 text-xs text-white/35">{(state.profiles * state.videos).toString().padStart(2, "0")} vídeos/mês</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Módulo Crescimento e Aquisição — só disclosure, sem preço próprio; preço vem dos 2 toggles internos */}
            <div className="border transition-colors duration-300" style={{ borderColor: state.growthOpen ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)" }}>
              <button type="button" onClick={toggleGrowthOpen} aria-expanded={state.growthOpen} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6">
                <div>
                  <p className="text-sm text-white/85">{content.growth.moduleLabel}</p>
                  <p className="mt-0.5 text-xs text-white/35">{activeGrowthLabels.length > 0 ? activeGrowthLabels.join(" · ") : "Opcional"}</p>
                </div>
                <ChevronDown className={`size-4 shrink-0 text-white/30 transition-transform duration-300 ${state.growthOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence initial={false}>
                {state.growthOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: "easeInOut" }} className="overflow-hidden">
                    <div className="flex flex-col divide-y divide-white/10 border-t border-white/10 px-5 sm:px-6">
                      {content.growth.toggles.map((toggleItem) => {
                        const active = Boolean(state.toggles[toggleItem.id]);
                        return (
                          <button key={toggleItem.id} type="button" onClick={() => toggleGrowthItem(toggleItem.id)} aria-pressed={active} className="flex items-center justify-between gap-4 py-4 text-left">
                            <div className="flex items-center gap-3.5">
                              <GlowDot active={active} accent={accent} onToggle={() => toggleGrowthItem(toggleItem.id)} label={toggleItem.label} />
                              <span className="text-sm" style={{ color: active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.55)" }}>
                                {toggleItem.label}
                              </span>
                            </div>
                            <span className="shrink-0 font-mono text-xs" style={{ color: active ? accent : "rgba(255,255,255,0.35)" }}>
                              + {currency.format(toggleItem.price)}/mês
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
