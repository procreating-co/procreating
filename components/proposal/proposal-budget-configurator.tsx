"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Check, Clapperboard, Minus, Plus } from "lucide-react";
import type { BudgetConfigurator, BudgetContent } from "@/lib/comercial/proposal-content-types";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const pad2 = (n: number) => String(n).padStart(2, "0");

type DeltaKind = "pos" | "neg" | "zero";

function Delta({ value, kind }: { value: number; kind: DeltaKind }) {
  if (kind === "zero") return <span className="min-w-20 shrink-0 text-right font-mono text-xs text-white/30">—</span>;
  const sign = kind === "pos" ? "+" : "−";
  return <span className={`min-w-20 shrink-0 text-right font-mono text-xs ${kind === "pos" ? "text-emerald-400" : "text-white/70"}`}>{sign} {currency.format(Math.abs(value))}</span>;
}

function Stepper({ value, min, max, accent, onChange }: { value: number; min: number; max: number; accent: string; onChange: (next: number) => void }) {
  return (
    <div className="flex shrink-0 items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Diminuir"
        className="flex size-7 items-center justify-center rounded-full border text-sm transition-colors disabled:pointer-events-none disabled:opacity-25"
        style={{ borderColor: accent, color: accent }}
      >
        <Minus className="size-3" />
      </button>
      <span className="min-w-4 text-center font-mono text-sm tabular-nums text-white">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Aumentar"
        className="flex size-7 items-center justify-center rounded-full border text-sm transition-colors disabled:pointer-events-none disabled:opacity-25"
        style={{ borderColor: accent, color: accent }}
      >
        <Plus className="size-3" />
      </button>
    </div>
  );
}

function Toggle({ on, accent, onChange }: { on: boolean; accent: string; onChange: (next: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="relative h-6 w-[42px] shrink-0 rounded-full transition-colors"
      style={{ backgroundColor: on ? accent : "rgba(255,255,255,0.15)" }}
    >
      <span className="absolute top-0.5 size-5 rounded-full bg-white transition-transform" style={{ transform: on ? "translateX(19px)" : "translateX(3px)" }} />
    </button>
  );
}

/**
 * Configurador de investimento — mockup fornecido pelo usuário, traduzido pra React/Tailwind com
 * a identidade da proposta (`accent`, não a cor fixa do mockup) e reaproveitando os tokens já
 * usados no resto de `components/proposal/**` (bg-black, border-white/10, font-mono pra
 * eyebrow/números — mesmo padrão de `ProposalSectionHeader`/`RoadmapStageRow`). Design
 * transparente de propósito (preço unitário sempre visível) — diferente do `ProposalBudget`
 * clássico ou do `upsell` v1.
 */
export function ProposalBudgetConfigurator({ content, configurator, accent }: { content: BudgetContent; configurator: BudgetConfigurator; accent: string }) {
  const [addonQty, setAddonQty] = useState<Record<string, number>>({});
  const [removableOn, setRemovableOn] = useState<Record<string, boolean>>(() => Object.fromEntries(configurator.removables.map((r) => [r.id, r.defaultOn])));
  const [videoCount, setVideoCount] = useState(configurator.videoRange?.initial ?? configurator.baseVideos);

  const videoRange = configurator.videoRange;
  const videosRemoved = videoRange ? videoRange.initial - videoCount : 0;
  const extraLocations = configurator.addons.filter((a) => a.kind === "location").reduce((sum, a) => sum + (addonQty[a.id] ?? 0), 0);
  const extraVideosFromAddons = configurator.addons.filter((a) => a.kind === "video").reduce((sum, a) => sum + (addonQty[a.id] ?? 0), 0);

  const locations = configurator.baseLocations + extraLocations;
  const videosDelivered = (videoRange ? videoCount : configurator.baseVideos) + extraVideosFromAddons;

  const additionsTotal = configurator.addons.reduce((sum, a) => sum + (addonQty[a.id] ?? 0) * a.unitPrice, 0);
  const removableSavings = configurator.removables.reduce((sum, r) => sum + (removableOn[r.id] ? 0 : r.savings), 0);
  const videoRangeSavings = videoRange ? videosRemoved * videoRange.unitPrice : 0;
  const total = content.heroNumber + additionsTotal - removableSavings - videoRangeSavings;
  const perVideo = Math.round(total / Math.max(videosDelivered, 1));

  const showAnchor = configurator.anchorPrice != null && configurator.anchorPrice > total;

  const receiptRows: { label: string; amount: number; tone?: "muted" }[] = [
    { label: `Pacote base (${pad2(configurator.baseLocations)} captações · ${pad2(configurator.baseVideos)} vídeos)`, amount: content.heroNumber },
  ];
  for (const removable of configurator.removables) {
    if (!removableOn[removable.id]) receiptRows.push({ label: `Sem ${removable.label.toLowerCase()}`, amount: -removable.savings });
  }
  if (videoRange && videosRemoved > 0) receiptRows.push({ label: `Redução de ${videosRemoved} vídeo(s) entregue(s)`, amount: -videoRangeSavings });
  for (const addon of configurator.addons) {
    const qty = addonQty[addon.id] ?? 0;
    if (qty > 0) receiptRows.push({ label: `${qty} × ${addon.label.toLowerCase()}`, amount: qty * addon.unitPrice });
  }

  return (
    <section className="border-t border-white/10 bg-black px-6 py-24 text-white lg:px-12 lg:py-32">
      <div className="mx-auto max-w-2xl">
        {/* A — hero: âncora + preço + condição de pagamento + escopo */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 0.6, ease: "easeOut" }} className="flex flex-col items-center text-center">
          {showAnchor && (
            <div className="mb-1.5 flex items-center gap-2 text-sm">
              <span className="font-mono text-white/35 line-through">{currency.format(configurator.anchorPrice!)}</span>
              <span className="text-xs text-white/35">{configurator.anchorLabel}</span>
            </div>
          )}
          <p className="font-mono text-6xl font-medium tabular-nums text-white sm:text-7xl">
            <span className="mr-1 text-3xl font-normal text-white/50">R$</span>
            {total.toLocaleString("pt-BR")}
          </p>

          {configurator.paymentTerms && (
            <div className="mt-5 rounded-full border px-4 py-2 font-mono text-xs text-white" style={{ borderColor: "rgba(255,255,255,0.16)", backgroundColor: `${accent}1f` }}>
              {configurator.paymentTerms}
            </div>
          )}

          <p className="mt-6 max-w-sm text-sm text-white/60">
            <b style={{ color: accent }}>{pad2(locations)}</b> captações em <b style={{ color: accent }}>{pad2(locations)}</b> locações · <b style={{ color: accent }}>{pad2(videosDelivered)}</b> vídeos estratégicos entregues
          </p>
          <p className="mt-1.5 font-mono text-xs text-white/30">≈ {currency.format(perVideo)} por vídeo entregue</p>
        </motion.div>

        <div className="mx-auto mt-14 border-t border-white/10" />

        {/* B — captação / entrega */}
        <div className="mt-14 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 p-5">
            <span className="mb-3.5 flex size-7 items-center justify-center rounded-lg border text-xs" style={{ borderColor: accent, color: accent }}>
              <Camera className="size-3.5" />
            </span>
            <h3 className="text-[15px] font-semibold text-white">{configurator.captureLabel}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-white/55">
              {pad2(locations)} diária(s) de captação em {pad2(locations)} locação(ões)
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-white/55">{configurator.teamSummary}</p>
          </div>
          <div className="rounded-2xl border border-white/10 p-5">
            <span className="mb-3.5 flex size-7 items-center justify-center rounded-lg border text-xs" style={{ borderColor: accent, color: accent }}>
              <Clapperboard className="size-3.5" />
            </span>
            <h3 className="text-[15px] font-semibold text-white">{configurator.deliveryLabel}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-white/55">{pad2(videosDelivered)} vídeos estratégicos editados</p>
            <p className="mt-1 text-[13px] leading-relaxed text-white/55">{configurator.deliveryNote}</p>
          </div>
        </div>

        <div className="mx-auto mt-14 border-t border-white/10" />

        {/* C — personalizar */}
        <div className="mt-14">
          <p className="font-mono text-xs uppercase tracking-wide" style={{ color: accent }}>
            Personalize seu pacote
          </p>
          <p className="mt-1 text-[13px] text-white/40">Ajuste o escopo e veja o valor mudar em tempo real.</p>

          {configurator.addons.length > 0 && (
            <>
              <p className="mb-2.5 mt-6 text-[11px] uppercase tracking-wide text-white/35">Adicionar</p>
              <div className="flex flex-col gap-2.5">
                {configurator.addons.map((addon) => {
                  const qty = addonQty[addon.id] ?? 0;
                  return (
                    <div key={addon.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 px-4.5 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-white">{addon.label}</span>
                        <span className="text-xs text-white/40">
                          {addon.sublabel} · <span className="font-mono text-white/55">{currency.format(addon.unitPrice)}</span> {addon.unitLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Stepper value={qty} min={0} max={addon.max} accent={accent} onChange={(next) => setAddonQty((prev) => ({ ...prev, [addon.id]: next }))} />
                        <Delta value={qty * addon.unitPrice} kind={qty > 0 ? "pos" : "zero"} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {(configurator.removables.length > 0 || videoRange) && (
            <>
              <p className="mb-2.5 mt-7 text-[11px] uppercase tracking-wide text-white/35">Reduzir</p>
              <div className="flex flex-col gap-2.5">
                {configurator.removables.map((removable) => {
                  const on = removableOn[removable.id] ?? removable.defaultOn;
                  return (
                    <div key={removable.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 px-4.5 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-white">{removable.label}</span>
                        <span className="text-xs text-white/40">{removable.sublabel}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Toggle on={on} accent={accent} onChange={(next) => setRemovableOn((prev) => ({ ...prev, [removable.id]: next }))} />
                        <Delta value={on ? 0 : -removable.savings} kind={on ? "zero" : "neg"} />
                      </div>
                    </div>
                  );
                })}
                {videoRange && (
                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 px-4.5 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-white">{videoRange.label}</span>
                      <span className="text-xs text-white/40">
                        {videoRange.sublabel} · <span className="font-mono text-white/55">−{currency.format(videoRange.unitPrice)}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Stepper value={videoCount} min={videoRange.min} max={videoRange.max} accent={accent} onChange={setVideoCount} />
                      <Delta value={-videosRemoved * videoRange.unitPrice} kind={videosRemoved > 0 ? "neg" : "zero"} />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Recibo ao vivo */}
          <div className="mt-7 rounded-2xl border border-white/10 px-5 pb-1.5 pt-5">
            {receiptRows.map((row, index) => (
              <div key={index} className="flex justify-between pb-3.5 text-[13.5px] text-white/60">
                <span>{row.label}</span>
                <span className="font-mono tabular-nums">
                  {row.amount >= 0 ? "" : "− "}
                  {currency.format(Math.abs(row.amount))}
                </span>
              </div>
            ))}
            <div className="flex justify-between border-t border-white/10 pb-3.5 pt-3.5 text-base font-semibold text-white">
              <span>Total</span>
              <span className="font-mono text-lg tabular-nums" style={{ color: accent }}>
                {currency.format(total)}
              </span>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-14 border-t border-white/10" />

        {/* D — incluso / adicionais avulsos */}
        <div className="mt-10 grid grid-cols-1 gap-9 sm:grid-cols-2">
          <div>
            <p className="mb-3.5 font-mono text-xs uppercase tracking-wide text-white/35">Incluso</p>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-start gap-2.5 text-[13.5px] text-white/70">
                <Check className="mt-0.5 size-3.5 shrink-0" style={{ color: accent }} />
                {pad2(locations)} captações em {pad2(locations)} locações
              </div>
              <div className="flex items-start gap-2.5 text-[13.5px] text-white/70">
                <Check className="mt-0.5 size-3.5 shrink-0" style={{ color: accent }} />
                {pad2(videosDelivered)} vídeos estratégicos entregues
              </div>
              <div className="flex items-start gap-2.5 text-[13.5px] text-white/70">
                <Check className="mt-0.5 size-3.5 shrink-0" style={{ color: accent }} />
                {configurator.teamSummary}
              </div>
              {configurator.paymentTerms && (
                <div className="flex items-start gap-2.5 text-[13.5px] text-white/70">
                  <Check className="mt-0.5 size-3.5 shrink-0" style={{ color: accent }} />
                  {configurator.paymentTerms}
                </div>
              )}
            </div>
          </div>
          {configurator.addons.length > 0 && (
            <div>
              <p className="mb-3.5 font-mono text-xs uppercase tracking-wide text-white/35">Adicionais avulsos</p>
              <div className="flex flex-col gap-2.5">
                {configurator.addons.map((addon) => (
                  <div key={addon.id} className="flex justify-between text-[13.5px] text-white/60">
                    <span>{addon.label}</span>
                    <span className="font-mono text-white">{currency.format(addon.unitPrice)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
