"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { ProposalSectionHeader } from "@/components/proposal/proposal-section-header";
import type { ProposalContent } from "@/lib/clients/proposal-types";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export function ProposalConfigurator({ content, accent }: { content: ProposalContent["configurator"]; accent: string }) {
  const recommendedTier = content.videoTiers.find((tier) => tier.recommended) ?? content.videoTiers[0];
  const [tierId, setTierId] = useState(recommendedTier.id);
  const [modules, setModules] = useState<Record<string, boolean>>({});

  const selectedTier = content.videoTiers.find((tier) => tier.id === tierId) ?? recommendedTier;
  const activeModules = content.optionalModules.filter((module) => modules[module.id]);
  const total = selectedTier.price + activeModules.reduce((sum, module) => sum + module.price, 0);

  const toggleModule = (id: string) => setModules((current) => ({ ...current, [id]: !current[id] }));

  return (
    <section id="configurador" className="scroll-mt-20 bg-black px-6 py-24 text-white lg:px-12 lg:py-32">
      <div className="mx-auto max-w-[1100px]">
        <ProposalSectionHeader eyebrow={content.eyebrow} heading={content.heading} accent={accent} />
        <p className="mx-auto mt-6 max-w-xl text-balance text-center text-base leading-relaxed text-white/55">{content.subtitle}</p>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px] lg:items-start lg:gap-14">
          <div className="flex flex-col gap-12">
            {/* Vídeos por mês */}
            <div>
              <p className="mb-5 font-mono text-xs uppercase tracking-wide text-white/45">{content.videoTiersLabel}</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {content.videoTiers.map((tier) => {
                  const isSelected = tier.id === tierId;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setTierId(tier.id)}
                      aria-pressed={isSelected}
                      className="relative flex flex-col items-start gap-3 border p-6 text-left transition-all duration-300"
                      style={{
                        borderColor: isSelected ? accent : "rgba(255,255,255,0.12)",
                        backgroundColor: isSelected ? `${accent}14` : "transparent",
                      }}
                    >
                      {tier.recommended && (
                        <span className="absolute -top-3 left-6 rounded-full px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-black" style={{ backgroundColor: accent }}>
                          Nossa recomendação
                        </span>
                      )}
                      <span className="font-display text-3xl text-white">{tier.count}</span>
                      <span className="font-mono text-xs uppercase tracking-wide text-white/50">vídeos/mês</span>
                      <span className="mt-1 font-display text-xl" style={{ color: isSelected ? accent : "rgba(255,255,255,0.8)" }}>
                        {currency.format(tier.price)}
                      </span>
                      <span
                        className="mt-2 flex size-5 shrink-0 items-center justify-center rounded-full border"
                        style={{ borderColor: isSelected ? accent : "rgba(255,255,255,0.25)", backgroundColor: isSelected ? accent : "transparent" }}
                        aria-hidden="true"
                      >
                        {isSelected && <Check className="size-3 text-black" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Módulos estratégicos */}
            <div>
              <p className="mb-5 font-mono text-xs uppercase tracking-wide text-white/45">{content.modulesLabel}</p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-4 border border-white/10 bg-white/[0.02] px-5 py-4">
                  <div>
                    <p className="font-display text-lg text-white">{content.includedModule.label}</p>
                    <p className="mt-0.5 text-sm text-white/50">{content.includedModule.description}</p>
                  </div>
                  <span className="shrink-0 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wide" style={{ borderColor: accent, color: accent }}>
                    Incluso
                  </span>
                </div>

                {content.optionalModules.map((module) => {
                  const isActive = Boolean(modules[module.id]);
                  return (
                    <button
                      key={module.id}
                      type="button"
                      onClick={() => toggleModule(module.id)}
                      aria-pressed={isActive}
                      className="flex items-center justify-between gap-4 border px-5 py-4 text-left transition-all duration-300"
                      style={{ borderColor: isActive ? accent : "rgba(255,255,255,0.12)", backgroundColor: isActive ? `${accent}14` : "transparent" }}
                    >
                      <div className="flex items-start gap-3.5">
                        <span
                          className="mt-1 flex size-5 shrink-0 items-center justify-center rounded border"
                          style={{ borderColor: isActive ? accent : "rgba(255,255,255,0.25)", backgroundColor: isActive ? accent : "transparent" }}
                          aria-hidden="true"
                        >
                          {isActive && <Check className="size-3 text-black" />}
                        </span>
                        <div>
                          <p className="font-display text-lg text-white">{module.label}</p>
                          <p className="mt-0.5 text-sm text-white/50">{module.description}</p>
                        </div>
                      </div>
                      <span className="shrink-0 font-mono text-sm" style={{ color: isActive ? accent : "rgba(255,255,255,0.5)" }}>
                        +{currency.format(module.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Total — sempre visível */}
          <div className="lg:sticky lg:top-28">
            <div className="border border-white/15 bg-white/[0.03] p-7">
              <p className="font-mono text-xs uppercase tracking-wide text-white/45">Valor mensal</p>
              <p className="mt-3 font-display text-4xl text-white sm:text-5xl">{currency.format(total)}</p>
              <p className="mt-1 font-mono text-xs text-white/40">/mês</p>

              <div className="mt-6 flex flex-col gap-2 border-t border-white/10 pt-5 text-sm text-white/60">
                <div className="flex items-center justify-between">
                  <span>{selectedTier.label}</span>
                  <span>{currency.format(selectedTier.price)}</span>
                </div>
                <div className="flex items-center justify-between text-white/40">
                  <span>{content.includedModule.label}</span>
                  <span>Incluso</span>
                </div>
                {activeModules.map((module) => (
                  <div key={module.id} className="flex items-center justify-between">
                    <span>{module.label}</span>
                    <span>+{currency.format(module.price)}</span>
                  </div>
                ))}
              </div>

              <a
                href="#fechamento"
                className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-medium text-black transition-transform duration-300 hover:scale-[1.02]"
                style={{ backgroundColor: accent }}
              >
                Falar sobre essa operação
                <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
