"use client";

import { useEffect, useState } from "react";
import { animate, motion, useMotionValue } from "framer-motion";
import { ProposalPascoalSectionHeader } from "@/components/proposal-pascoal/proposal-pascoal-section-header";
import type { PascoalProposalContent } from "@/lib/pascoal-proposal/types";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/** Preço puramente aditivo — nenhuma tabela de casos, só soma o que está ligado. */
function computeTotal(base: number, trafficOn: boolean, trafficDelta: number, prospectingOn: boolean, prospectingDelta: number) {
  return base + (trafficOn ? trafficDelta : 0) + (prospectingOn ? prospectingDelta : 0);
}

/** Número do investimento com uma pequena animação de contagem sempre que o total muda. */
function AnimatedTotal({ total }: { total: number }) {
  const motionTotal = useMotionValue(total);
  const [display, setDisplay] = useState(total);

  useEffect(() => {
    const controls = animate(motionTotal, total, {
      duration: 0.5,
      ease: "easeOut",
      onUpdate: (value) => setDisplay(Math.round(value)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  return <span>{currency.format(display)}</span>;
}

export function ProposalPascoalConfigurator({ content, accent }: { content: PascoalProposalContent["configurator"]; accent: string }) {
  const [videoId, setVideoId] = useState(content.videoOptions[content.videoOptions.length - 1].id);
  const [trafficOn, setTrafficOn] = useState(true);
  const [prospectingOn, setProspectingOn] = useState(true);

  const videoOption = content.videoOptions.find((option) => option.id === videoId) ?? content.videoOptions[0];
  const { traffic, prospecting } = content.toggles;
  const total = Math.max(content.minPrice, computeTotal(videoOption.base, trafficOn, traffic.priceDelta, prospectingOn, prospecting.priceDelta));

  const isRecommended = videoOption === content.videoOptions[content.videoOptions.length - 1] && trafficOn && prospectingOn;

  const deliverables = [
    `${videoOption.count} vídeos`,
    "Estratégia",
    "Posicionamento",
    ...(trafficOn ? ["Tráfego"] : []),
    ...(prospectingOn ? ["Prospecção ativa"] : []),
  ].join(" · ");

  return (
    <section id="configurador" className="scroll-mt-20 border-t border-white/10 bg-black px-6 py-24 text-white lg:px-12 lg:py-32">
      <div className="mx-auto max-w-3xl">
        <ProposalPascoalSectionHeader eyebrow={content.eyebrow} heading={content.heading} accent={accent} />
        <p className="mx-auto mt-6 max-w-lg text-balance text-center text-base leading-relaxed text-white/55">{content.subtitle}</p>
      </div>

      <div className="mx-auto mt-14 max-w-2xl">
        {/* Investimento mensal — sempre centralizado e em destaque */}
        <div className="flex flex-col items-center border border-white/15 bg-white/[0.03] px-8 py-12 text-center">
          <span className="font-mono text-xs uppercase tracking-wide text-white/45">Investimento mensal</span>
          <p className="mt-4 font-display text-6xl tabular-nums text-white sm:text-7xl">
            <AnimatedTotal total={total} />
          </p>
          <span
            className="mt-5 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 font-mono text-[10px] uppercase tracking-wide transition-colors duration-300"
            style={{ backgroundColor: isRecommended ? accent : "transparent", color: isRecommended ? "black" : "rgba(255,255,255,0.5)", border: isRecommended ? "none" : "1px solid rgba(255,255,255,0.2)" }}
          >
            {isRecommended ? content.recommendedTag : content.customTag}
          </span>
          <p className="mt-6 max-w-sm text-balance font-mono text-xs uppercase tracking-wide text-white/40">{deliverables}</p>
        </div>

        {/* Controles */}
        <div className="mt-12 flex flex-col gap-10">
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-wide text-white/45">{content.contentLabel}</p>
            <div className="grid grid-cols-2 gap-4">
              {content.videoOptions.map((option) => {
                const isSelected = option.id === videoId;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setVideoId(option.id)}
                    aria-pressed={isSelected}
                    className="flex flex-col items-center gap-2 border py-6 text-center transition-all duration-300"
                    style={{ borderColor: isSelected ? accent : "rgba(255,255,255,0.12)", backgroundColor: isSelected ? `${accent}14` : "transparent" }}
                  >
                    <span className="font-display text-2xl text-white">{option.label}</span>
                    <span className="font-mono text-sm" style={{ color: isSelected ? accent : "rgba(255,255,255,0.45)" }}>
                      {currency.format(option.base)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-wide text-white/45">{content.strategyLabel}</p>
            <div className="flex items-center justify-between gap-4 border border-white/10 bg-white/[0.02] px-5 py-4">
              <p className="text-sm text-white/75">{content.strategyIncluded}</p>
              <span className="shrink-0 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wide" style={{ borderColor: accent, color: accent }}>
                Incluso
              </span>
            </div>
          </div>

          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-wide text-white/45">{content.growthLabel}</p>
            <button
              type="button"
              onClick={() => setTrafficOn((current) => !current)}
              aria-pressed={trafficOn}
              className="flex w-full items-center justify-between gap-4 border px-5 py-4 text-left transition-all duration-300"
              style={{ borderColor: trafficOn ? accent : "rgba(255,255,255,0.12)", backgroundColor: trafficOn ? `${accent}14` : "transparent" }}
            >
              <div>
                <p className="text-sm text-white/85">{traffic.label}</p>
                {traffic.note && <p className="mt-0.5 text-xs text-white/40">{traffic.note}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="font-mono text-sm" style={{ color: trafficOn ? accent : "rgba(255,255,255,0.4)" }}>
                  {trafficOn ? "+" : "−"}
                  {currency.format(traffic.priceDelta)}
                </span>
                <Toggle isOn={trafficOn} accent={accent} />
              </div>
            </button>
          </div>

          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-wide text-white/45">{content.expansionLabel}</p>
            <button
              type="button"
              onClick={() => setProspectingOn((current) => !current)}
              aria-pressed={prospectingOn}
              className="flex w-full items-center justify-between gap-4 border px-5 py-4 text-left transition-all duration-300"
              style={{ borderColor: prospectingOn ? accent : "rgba(255,255,255,0.12)", backgroundColor: prospectingOn ? `${accent}14` : "transparent" }}
            >
              <p className="text-sm text-white/85">{prospecting.label}</p>
              <div className="flex shrink-0 items-center gap-3">
                <span className="font-mono text-sm" style={{ color: prospectingOn ? accent : "rgba(255,255,255,0.4)" }}>
                  {prospectingOn ? "+" : "−"}
                  {currency.format(prospecting.priceDelta)}
                </span>
                <Toggle isOn={prospectingOn} accent={accent} />
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Toggle({ isOn, accent }: { isOn: boolean; accent: string }) {
  return (
    <span className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-300" style={{ backgroundColor: isOn ? accent : "rgba(255,255,255,0.15)" }} aria-hidden="true">
      <motion.span
        className="absolute size-[18px] rounded-full"
        animate={{ x: isOn ? 22 : 3 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        style={{ backgroundColor: isOn ? "black" : "white" }}
      />
    </span>
  );
}
