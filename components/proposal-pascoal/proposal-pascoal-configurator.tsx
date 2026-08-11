"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, MessageCircle, Lock } from "lucide-react";
import { ProposalPascoalConfiguratorMatrix, type MatrixSelection } from "@/components/proposal-pascoal/proposal-pascoal-configurator-matrix";
import { ProposalPascoalConfiguratorCompleto } from "@/components/proposal-pascoal/proposal-pascoal-configurator-completo";
import type { PascoalProposalContent, VideoCadence } from "@/lib/pascoal-proposal/types";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/** Um dígito do odômetro/roleta — coluna de 0-9 que desliza verticalmente. ~500ms, tween (não spring lento). */
function OdometerDigit({ digit }: { digit: string }) {
  if (!/[0-9]/.test(digit)) return <span className="inline-block">{digit}</span>;
  const value = Number(digit);
  return (
    <span className="relative inline-block h-[1em] w-[0.6em] overflow-hidden align-bottom">
      <motion.span className="absolute inset-x-0 top-0 flex flex-col items-center" initial={false} animate={{ y: `-${value}em` }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="block h-[1em] leading-[1em]">
            {i}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

function TotalValue({ value }: { value: number }) {
  return <span className="inline-flex">{currency.format(value).split("").map((char, i) => <OdometerDigit key={i} digit={char} />)}</span>;
}

function findMatrixPrice(content: PascoalProposalContent, perfilCount: 1 | 2, videos: VideoCadence): number | undefined {
  return content.configurator.content.matrixPrices.find((p) => p.perfilCount === perfilCount && p.videos === videos)?.price;
}

function buildWhatsAppMessage(content: PascoalProposalContent, matrix: MatrixSelection, planoCompletoActive: boolean, growth: Record<string, boolean>, total: number): string {
  const { configurator, whatsapp } = content;
  const perfilCount = matrix.perfis.length;
  const videos = perfilCount === 2 ? 4 : matrix.videos;
  const lines: string[] = [`Olá, ${whatsapp.ceoFirstName}! Estou entrando em contato através da proposta da Pascoal Bombas e gostaria de avançar com a seguinte estrutura:`, ""];

  if (planoCompletoActive) {
    lines.push(`Plano: Plano Completo (03 perfis, incluindo Perfil Expert — Julia Brigidio)`);
    lines.push(`Conteúdo: ${configurator.content.planoCompleto.videosTotal} vídeos no total`);
  } else if (perfilCount > 0) {
    const names = matrix.perfis.map((id) => configurator.content.perfis.find((p) => p.id === id)?.name).join(" + ");
    lines.push(`Plano: ${names}`);
    lines.push(`Conteúdo: ${videos} vídeos por perfil (${perfilCount * videos} vídeos/mês)`);
  } else {
    lines.push(`Plano: ${configurator.baseLabel}`);
  }

  for (const front of configurator.growth.fronts) {
    if (growth[front.id]) lines.push(`${front.label}: selecionado`);
  }

  lines.push("", `Valor estimado: ${currency.format(total)}/mês`, "", "Gostaria de avançar com essa estrutura.");
  return lines.join("\n");
}

export function ProposalPascoalConfigurator({ content, accent }: { content: PascoalProposalContent; accent: string }) {
  const { configurator, whatsapp, cta } = content;

  const [matrix, setMatrix] = useState<MatrixSelection>({ perfis: [], videos: 4, editing: false });
  const [planoCompletoActive, setPlanoCompletoActive] = useState(false);
  const [growth, setGrowth] = useState<Record<string, boolean>>({});
  const [ctaState, setCtaState] = useState<"idle" | "confirming">("idle");

  const perfilCount = matrix.perfis.length;
  const step1Answered = perfilCount > 0 || planoCompletoActive;
  const matrixVideos = perfilCount === 2 ? 4 : matrix.videos;
  const matrixPrice = perfilCount > 0 ? findMatrixPrice(content, perfilCount as 1 | 2, matrixVideos) : undefined;

  const baseValue = planoCompletoActive ? configurator.content.planoCompleto.price : perfilCount > 0 ? matrixPrice ?? configurator.basePrice : configurator.basePrice;
  const growthSum = configurator.growth.fronts.reduce((sum, f) => sum + (growth[f.id] ? f.price : 0), 0);
  const total = baseValue + growthSum;

  const activeFronts = configurator.growth.fronts.filter((f) => growth[f.id]);
  const hasExpandedScope = step1Answered || activeFronts.length > 0;

  const planLabel = planoCompletoActive
    ? configurator.content.planoCompleto.headline
    : perfilCount > 0
      ? `${configurator.content.moduleLabel} · ${perfilCount === 1 ? "01 Oficina" : "02 Oficinas"} · ${(perfilCount * matrixVideos).toString().padStart(2, "0")} vídeos/mês`
      : configurator.baseLabel;

  const selectPlanoCompleto = () => {
    setMatrix({ perfis: [], videos: 4, editing: false });
    setPlanoCompletoActive(true);
  };
  const backFromCompleto = () => setPlanoCompletoActive(false);
  const toggleFront = (id: string) => setGrowth((c) => ({ ...c, [id]: !c[id] }));

  const handleCta = () => {
    if (ctaState === "confirming") return;
    setCtaState("confirming");
    const message = buildWhatsAppMessage(content, matrix, planoCompletoActive, growth, total);
    window.setTimeout(() => {
      window.open(`https://wa.me/${whatsapp.phoneDigits}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
      setCtaState("idle");
    }, 700);
  };

  return (
    <section id="configurador" className="scroll-mt-20 border-t border-white/10 bg-black px-6 py-24 text-white lg:px-12 lg:py-32">
      <div className="mx-auto max-w-3xl">
        <p className="mb-4 text-center font-mono text-xs uppercase tracking-wide text-white/45">{configurator.eyebrow}</p>
        <h2 className="text-balance text-center font-display text-3xl leading-[1.05] tracking-tight text-white sm:text-4xl">{configurator.heading}</h2>
        <p className="mx-auto mt-3 max-w-md text-balance text-center text-sm text-white/50">{configurator.subheading}</p>

        {/* Resumo fixo — contexto ACIMA do preço, /mês na mesma linha, roleta em toda mudança */}
        <div
          className="relative mt-10 overflow-hidden border border-white/15 px-6 py-12 text-center sm:px-10"
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
            <span className="font-mono text-base font-normal text-white/40">/mês</span>
          </p>

          {activeFronts.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {activeFronts.map((f) => (
                <motion.span key={f.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wide" style={{ backgroundColor: `${accent}18`, color: accent }}>
                  {f.label}
                </motion.span>
              ))}
            </div>
          )}
        </div>

        {/* Etapa 1 — Plano de Posicionamento (matriz) ou Plano Completo */}
        <div className="mt-12">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-wide text-white/35">{configurator.content.stepLabel} · {configurator.content.moduleLabel}</p>
          <AnimatePresence mode="wait" initial={false}>
            {planoCompletoActive ? (
              <ProposalPascoalConfiguratorCompleto key="completo" content={content} accent={accent} onBack={backFromCompleto} />
            ) : (
              <motion.div key="matrix" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <ProposalPascoalConfiguratorMatrix content={content} accent={accent} selection={matrix} onChange={setMatrix} onSelectPlanoCompleto={selectPlanoCompleto} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Etapa 2 — Aceleração de Aquisição, bloqueada até a Etapa 1 ser respondida */}
        <div className="mt-10">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-wide text-white/35">
            {configurator.growth.stepLabel} · {configurator.growth.moduleLabel}
          </p>

          {!step1Answered ? (
            <div className="flex items-center gap-3 border border-dashed border-white/10 px-5 py-4 text-white/30">
              <Lock className="size-3.5 shrink-0" />
              <p className="text-xs">{configurator.growth.lockedNote}</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {configurator.growth.fronts.map((front) => {
                const active = Boolean(growth[front.id]);
                return (
                  <button
                    key={front.id}
                    type="button"
                    onClick={() => toggleFront(front.id)}
                    aria-pressed={active}
                    className="flex flex-col items-start gap-3 border p-5 text-left transition-all duration-300"
                    style={{ borderColor: active ? accent : "rgba(255,255,255,0.1)", backgroundColor: active ? `${accent}0d` : "transparent" }}
                  >
                    <div className="flex w-full items-start justify-between gap-3">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full border transition-all duration-200" style={{ backgroundColor: active ? accent : "transparent", borderColor: active ? accent : "rgba(255,255,255,0.25)" }}>
                        {active && <Check className="size-3 text-black" />}
                      </span>
                      {active ? (
                        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide" style={{ color: accent }}>
                          <Check className="size-3.5" /> Adicionado
                        </span>
                      ) : (
                        <span className="font-mono text-xs text-white/40">+ {currency.format(front.price)}/mês</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-white/85">{front.label}</p>
                      <p className="mt-1 text-xs leading-relaxed text-white/40">{front.benefit}</p>
                    </div>
                  </button>
                );
              })}
            </motion.div>
          )}
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
                  onClick={handleCta}
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

      {/* Resumo fixo no rodapé — só mobile */}
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
                <TotalValue value={total} /> <span className="font-mono text-[10px] font-normal text-white/40">/mês</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
