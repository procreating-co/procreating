"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, MessageCircle } from "lucide-react";
import type { PascoalProposalContent, OficinaCount, VideoCount } from "@/lib/pascoal-proposal/types";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/** Um dígito do odômetro/roleta — coluna de 0-9 que desliza verticalmente até o dígito certo. ~500ms, rápido e sofisticado (tween, não spring lento). */
function OdometerDigit({ digit }: { digit: string }) {
  if (!/[0-9]/.test(digit)) return <span className="inline-block">{digit}</span>;
  const value = Number(digit);
  return (
    <span className="relative inline-block h-[1em] w-[0.6em] overflow-hidden align-bottom">
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col items-center"
        initial={false}
        animate={{ y: `-${value}em` }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
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

function TotalValue({ value }: { value: number | null }) {
  if (value === null) return <span className="text-3xl sm:text-4xl">Valor a definir</span>;
  return (
    <span className="inline-flex">
      {currency.format(value).split("").map((char, index) => (
        <OdometerDigit key={index} digit={char} />
      ))}
    </span>
  );
}

type State = {
  assessoriaExpanded: boolean;
  contentActive: boolean;
  oficinas: OficinaCount;
  videos: VideoCount;
  toggles: Record<string, boolean>;
};

function getContentPrice(prices: PascoalProposalContent["configurator"]["steps"]["content"]["prices"], oficinas: OficinaCount, videos: VideoCount): number | null {
  return prices.find((p) => p.oficinas === oficinas && p.videos === videos)?.price ?? null;
}

function buildWhatsAppMessage(content: PascoalProposalContent, state: State, total: number | null): string {
  const { base, steps } = content.configurator;
  const lines: string[] = [
    `Olá, ${content.whatsapp.ceoFirstName}! Estou entrando em contato através da proposta da Pascoal Bombas e gostaria de avançar com a seguinte estrutura:`,
    "",
    `${base.label}: incluída`,
  ];
  if (state.contentActive) {
    lines.push(`${steps.content.moduleLabel}: ${state.oficinas} Oficina(s) · ${state.videos} vídeos por oficina (${state.oficinas * state.videos} vídeos/mês)`);
  }
  for (const toggleItem of steps.growth.toggles) {
    if (state.toggles[toggleItem.id]) lines.push(`${toggleItem.label}: selecionado`);
  }
  lines.push("");
  lines.push(total !== null ? `Valor estimado: ${currency.format(total)}/mês` : "Valor estimado: uma das opções escolhidas ainda não tem preço definido — a confirmar com a equipe.");
  lines.push("");
  lines.push("Gostaria de avançar com essa estrutura.");
  return lines.join("\n");
}

/** Selo pequeno — "Adicionado" (ativo) ou "+ R$X/mês" (inativo). Troca de estado é o próprio feedback, sem precisar de toast separado. */
function AddonStatus({ active, price, accent }: { active: boolean; price: number; accent: string }) {
  if (active) {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide" style={{ color: accent }}>
        <Check className="size-3.5" /> Adicionado ao seu plano
      </span>
    );
  }
  return <span className="font-mono text-xs text-white/40">+ {currency.format(price)}/mês</span>;
}

export function ProposalPascoalConfigurator({ content, accent }: { content: PascoalProposalContent; accent: string }) {
  const { configurator, whatsapp, cta } = content;
  const { base, steps } = configurator;

  const [state, setState] = useState<State>({ assessoriaExpanded: false, contentActive: false, oficinas: 1, videos: 4, toggles: {} });
  const [ctaState, setCtaState] = useState<"idle" | "confirming">("idle");

  const contentPrice = getContentPrice(steps.content.prices, state.oficinas, state.videos);
  const baseValue = state.contentActive ? contentPrice : base.price;
  const growthTotal = steps.growth.toggles.reduce((sum, t) => sum + (state.toggles[t.id] ? t.price : 0), 0);
  const total = baseValue === null ? null : baseValue + growthTotal;

  const activeGrowth = steps.growth.toggles.filter((t) => state.toggles[t.id]);
  const hasExpandedScope = state.contentActive || activeGrowth.length > 0;

  const planLabel = state.contentActive
    ? `${base.label} · ${state.oficinas.toString().padStart(2, "0")} Oficina${state.oficinas > 1 ? "s" : ""} · ${(state.oficinas * state.videos).toString().padStart(2, "0")} vídeos/mês`
    : base.label;

  const toggleAssessoria = () => setState((c) => ({ ...c, assessoriaExpanded: !c.assessoriaExpanded }));
  const toggleContent = () => setState((c) => ({ ...c, contentActive: !c.contentActive }));
  const selectOficinas = (oficinas: OficinaCount) => setState((c) => ({ ...c, oficinas }));
  const selectVideos = (videos: VideoCount) => setState((c) => ({ ...c, videos }));
  const toggleGrowth = (id: string) => setState((c) => ({ ...c, toggles: { ...c.toggles, [id]: !c.toggles[id] } }));

  const handleCtaClick = () => {
    if (ctaState === "confirming") return;
    setCtaState("confirming");
    const message = buildWhatsAppMessage(content, state, total);
    window.setTimeout(() => {
      window.open(`https://wa.me/${whatsapp.phoneDigits}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
      setCtaState("idle");
    }, 700);
  };

  return (
    <section id="configurador" className="scroll-mt-20 border-t border-white/10 bg-black px-6 py-24 text-white lg:px-12 lg:py-32">
      <div className="mx-auto max-w-3xl">
        <p className="mb-4 text-center font-mono text-xs uppercase tracking-wide text-white/45">Configurador de plano</p>
        <h2 className="text-balance text-center font-display text-3xl leading-[1.05] tracking-tight text-white sm:text-4xl">Monte a operação de marketing da Pascoal Bombas</h2>

        {/* Caixa do investimento — contexto ACIMA do preço, /mês na mesma linha, textura sutil, âncora visual da página inteira */}
        <div
          className="relative mt-12 overflow-hidden border border-white/15 px-6 py-12 text-center sm:px-10"
          style={{ background: `radial-gradient(ellipse 120% 100% at 50% 0%, ${accent}12, transparent 60%), rgba(255,255,255,0.02)`, boxShadow: `0 40px 80px -40px ${accent}20` }}
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/40">Investimento mensal</span>
          <AnimatePresence mode="wait">
            <motion.p key={planLabel} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25 }} className="mt-3 text-sm text-white/70">
              {planLabel}
            </motion.p>
          </AnimatePresence>
          <p className="mt-3 flex items-baseline justify-center gap-2 font-display text-5xl tabular-nums text-white sm:text-6xl">
            <TotalValue value={total} />
            {total !== null && <span className="font-mono text-base font-normal text-white/40">/mês</span>}
          </p>

          {activeGrowth.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {activeGrowth.map((t) => (
                <motion.span
                  key={t.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wide"
                  style={{ backgroundColor: `${accent}18`, color: accent }}
                >
                  {t.label}
                </motion.span>
              ))}
            </div>
          )}
        </div>

        {/* 01 — Estrutura estratégica: sempre inclusa, expande pra mostrar o que contém e o que não contempla */}
        <div className="mt-14">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-wide text-white/35">{base.stepLabel}</p>
          <div className="border transition-colors duration-300" style={{ borderColor: `${accent}50` }}>
            <button type="button" onClick={toggleAssessoria} aria-expanded={state.assessoriaExpanded} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6">
              <div className="flex items-center gap-3.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: accent }}>
                  <Check className="size-3 text-black" />
                </span>
                <div>
                  <p className="text-sm text-white/90">{base.label}</p>
                  <p className="mt-0.5 text-xs text-white/35">Sempre incluída</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden font-mono text-sm text-white/50 sm:inline">{currency.format(base.price)}</span>
                <ChevronDown className={`size-4 shrink-0 text-white/30 transition-transform duration-300 ${state.assessoriaExpanded ? "rotate-180" : ""}`} />
              </div>
            </button>
            <AnimatePresence initial={false}>
              {state.assessoriaExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
                  <p className="border-t border-white/10 px-5 py-4 text-sm leading-relaxed text-white/60 sm:px-6">{base.includedItem}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 02 — Expansões: Plano de Posicionamento em destaque (recomendado), depois aquisição */}
        <div className="mt-10">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-wide text-white/35">{steps.content.stepLabel}</p>

          <div className="border transition-colors duration-300" style={{ borderColor: state.contentActive ? accent : "rgba(255,255,255,0.1)" }}>
            <button type="button" onClick={toggleContent} aria-pressed={state.contentActive} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6">
              <div className="flex items-start gap-3.5">
                <span
                  className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300"
                  style={{ backgroundColor: state.contentActive ? accent : "transparent", borderColor: state.contentActive ? accent : "rgba(255,255,255,0.25)" }}
                >
                  {state.contentActive && <Check className="size-3 text-black" />}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm" style={{ color: state.contentActive ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.75)" }}>
                      {steps.content.moduleLabel}
                    </p>
                    {steps.content.highlightTag && !state.contentActive && (
                      <span className="rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide" style={{ backgroundColor: `${accent}20`, color: accent }}>
                        {steps.content.highlightTag}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 max-w-xs text-xs leading-relaxed text-white/40">{steps.content.moduleBenefit}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {!state.contentActive && <ChevronDown className="size-4 text-white/30 transition-transform duration-300" style={{ transform: state.contentActive ? "rotate(180deg)" : undefined }} />}
                {state.contentActive && <ChevronDown className="size-4 rotate-180 text-white/30 transition-transform duration-300" />}
              </div>
            </button>

            <AnimatePresence initial={false}>
              {state.contentActive && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
                  <div className="border-t border-white/10 px-5 py-5 sm:px-6">
                    <p className="mb-3 font-mono text-[10px] uppercase tracking-wide text-white/35">{steps.content.triggerLabel}</p>

                    <p className="mb-2 font-mono text-[10px] uppercase tracking-wide text-white/35">Número de oficinas</p>
                    <div className="grid grid-cols-3 gap-2">
                      {steps.content.oficinaOptions.map((option) => {
                        const isSelected = option.value === state.oficinas;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => selectOficinas(option.value)}
                            aria-pressed={isSelected}
                            className="rounded-md border py-2.5 text-center text-xs font-medium transition-all duration-200"
                            style={{ borderColor: isSelected ? accent : "rgba(255,255,255,0.12)", backgroundColor: isSelected ? accent : "transparent", color: isSelected ? "black" : "rgba(255,255,255,0.55)" }}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>

                    <p className="mb-2 mt-4 font-mono text-[10px] uppercase tracking-wide text-white/35">Vídeos mensais por oficina</p>
                    <div className="grid grid-cols-2 gap-2">
                      {steps.content.videoOptions.map((option) => {
                        const isSelected = option.value === state.videos;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => selectVideos(option.value)}
                            aria-pressed={isSelected}
                            className="rounded-md border py-2.5 text-center text-xs font-medium transition-all duration-200"
                            style={{ borderColor: isSelected ? accent : "rgba(255,255,255,0.12)", backgroundColor: isSelected ? accent : "transparent", color: isSelected ? "black" : "rgba(255,255,255,0.55)" }}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                      <p className="text-xs text-white/50">
                        {state.oficinas.toString().padStart(2, "0")} Oficina(s) × {state.videos.toString().padStart(2, "0")} vídeos — {(state.oficinas * state.videos).toString().padStart(2, "0")} vídeos/mês
                      </p>
                      <AddonStatus active price={contentPrice ?? 0} accent={accent} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Aquisição — 2 upsells secundários, hierarquia menor que o Plano de Posicionamento */}
          <p className="mb-3 mt-8 font-mono text-[10px] uppercase tracking-wide text-white/35">{steps.growth.stepLabel}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {steps.growth.toggles.map((toggleItem) => {
              const active = Boolean(state.toggles[toggleItem.id]);
              return (
                <button
                  key={toggleItem.id}
                  type="button"
                  onClick={() => toggleGrowth(toggleItem.id)}
                  aria-pressed={active}
                  className="flex flex-col items-start gap-3 border p-5 text-left transition-all duration-300"
                  style={{ borderColor: active ? accent : "rgba(255,255,255,0.1)", backgroundColor: active ? `${accent}0d` : "transparent" }}
                >
                  <div className="flex w-full items-start justify-between gap-3">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300" style={{ backgroundColor: active ? accent : "transparent", borderColor: active ? accent : "rgba(255,255,255,0.25)" }}>
                      {active && <Check className="size-3 text-black" />}
                    </span>
                    <AddonStatus active={active} price={toggleItem.price} accent={accent} />
                  </div>
                  <div>
                    <p className="text-sm text-white/85">{toggleItem.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-white/40">{toggleItem.benefit}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA final — só aparece com escopo além da estrutura inicial */}
        <AnimatePresence initial={false}>
          {hasExpandedScope && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="overflow-hidden">
              <div className="mt-14 flex flex-col items-center border-t border-white/10 pt-12 text-center">
                <p className="font-mono text-xs uppercase tracking-wide text-white/40">{cta.confirmationHeading}</p>
                <p className="mt-1 max-w-sm text-balance text-sm text-white/55">{cta.confirmationSubheading}</p>

                <button
                  type="button"
                  onClick={handleCtaClick}
                  disabled={ctaState === "confirming"}
                  className="mt-6 inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-medium text-black transition-all duration-300 hover:scale-[1.03] disabled:opacity-80"
                  style={{ backgroundColor: accent }}
                >
                  {ctaState === "confirming" ? (
                    <>
                      <Check className="size-4" /> Plano confirmado — abrindo WhatsApp
                    </>
                  ) : (
                    <>
                      <MessageCircle className="size-4" /> {cta.label}
                    </>
                  )}
                </button>
                <p className="mt-4 text-xs text-white/35">{cta.note}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Resumo/valor fixo no rodapé — só mobile, some quando a seção sai da tela (sticky dentro da própria section) */}
      <div className="sticky bottom-4 z-20 mx-auto mt-8 flex max-w-3xl justify-center lg:hidden">
        <AnimatePresence>
          {hasExpandedScope && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="flex items-center gap-3 rounded-full border border-white/15 bg-black/90 px-5 py-2.5 backdrop-blur-md"
              style={{ boxShadow: "0 10px 30px -10px rgba(0,0,0,0.6)" }}
            >
              <span className="font-mono text-xs text-white/50">Total</span>
              <span className="flex items-baseline gap-1 font-display text-lg text-white">
                <TotalValue value={total} />
                {total !== null && <span className="font-mono text-[10px] font-normal text-white/40">/mês</span>}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
