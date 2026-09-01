"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Check, Clapperboard, Minus, Plus, Sparkles, Video } from "lucide-react";
import type { BudgetConfigurator, BudgetContent, BudgetTeamRole } from "@/lib/comercial/proposal-content-types";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const pad2 = (n: number) => String(n).padStart(2, "0");

const TEAM_ROLE_ICON: Record<BudgetTeamRole["role"], typeof Camera> = {
  videomaker: Video,
  fotografo: Camera,
  drone: Sparkles,
  editor: Clapperboard,
  outro: Check,
};

/* Alvo de toque — pedido explícito de auditoria mobile: botão de +/- media 28px (`size-7`),
 * abaixo do mínimo de ~44px recomendado (Apple HIG/Material). `size-11` (44px) resolve sem
 * distorcer a composição visual (o resto do card já tem espaço de sobra pra isso). */
function Stepper({ value, min, max, accent, onChange }: { value: number; min: number; max: number; accent: string; onChange: (next: number) => void }) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Diminuir"
        className="flex size-11 items-center justify-center rounded-full border text-sm transition-colors active:scale-95 disabled:pointer-events-none disabled:opacity-25"
        style={{ borderColor: accent, color: accent }}
      >
        <Minus className="size-4" />
      </button>
      <span className="min-w-5 text-center font-mono text-sm tabular-nums text-white">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Aumentar"
        className="flex size-11 items-center justify-center rounded-full border text-sm transition-colors active:scale-95 disabled:pointer-events-none disabled:opacity-25"
        style={{ borderColor: accent, color: accent }}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

/* Alvo de toque maior que o track visual (44px de altura clicável, track continua fino/compacto
 * — mesmo truque de área de toque expandida sem alterar a aparência do componente). */
function Toggle({ on, accent, onChange }: { on: boolean; accent: string; onChange: (next: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className="flex min-h-11 min-w-11 shrink-0 items-center justify-center">
      <span className="relative h-6 w-[42px] rounded-full transition-colors" style={{ backgroundColor: on ? accent : "rgba(255,255,255,0.15)" }}>
        <span className="absolute top-0.5 size-5 rounded-full bg-white transition-transform" style={{ transform: on ? "translateX(19px)" : "translateX(3px)" }} />
      </span>
    </button>
  );
}

/**
 * Configurador de investimento — v3, pedido explícito: o valor sai do topo e vira a ÚLTIMA coisa
 * da seção, revelado depois de "O que está incluso"/"Personalize seu pacote" — narrativa
 * "aqui está o que você recebe → personalize → aqui está o investimento", em vez de abrir com um
 * número. Preço unitário de cada item nunca aparece em lugar nenhum (nem texto, nem delta, nem
 * recibo, nem rodapé) — só o total final muda ao vivo conforme a personalização. Identidade da
 * proposta (`accent`), mesmos tokens de `components/proposal/**`.
 */
export function ProposalBudgetConfigurator({ content, configurator, accent }: { content: BudgetContent; configurator: BudgetConfigurator; accent: string }) {
  const [addonQty, setAddonQty] = useState<Record<string, number>>({});
  const [removableOn, setRemovableOn] = useState<Record<string, boolean>>(() => Object.fromEntries(configurator.removables.map((r) => [r.id, r.defaultOn])));
  const [videoCount, setVideoCount] = useState(configurator.videoRange?.initial ?? configurator.baseVideos);

  const videoRange = configurator.videoRange;
  const extraLocations = configurator.addons.filter((a) => a.kind === "location").reduce((sum, a) => sum + (addonQty[a.id] ?? 0), 0);
  const extraVideosFromAddons = configurator.addons.filter((a) => a.kind === "video").reduce((sum, a) => sum + (addonQty[a.id] ?? 0), 0);

  const locations = configurator.baseLocations + extraLocations;
  const videosDelivered = (videoRange ? videoCount : configurator.baseVideos) + extraVideosFromAddons;

  const additionsTotal = configurator.addons.reduce((sum, a) => sum + (addonQty[a.id] ?? 0) * a.unitPrice, 0);
  const removableSavings = configurator.removables.reduce((sum, r) => sum + (removableOn[r.id] ? 0 : r.savings), 0);
  const videoRangeSavings = videoRange ? (videoRange.initial - videoCount) * videoRange.unitPrice : 0;
  const total = content.heroNumber + additionsTotal - removableSavings - videoRangeSavings;

  return (
    <section className="border-t border-white/10 bg-black px-6 py-24 text-white lg:px-12 lg:py-32">
      <div className="mx-auto max-w-2xl">
        {/* A — só o título "Orçamento", nada mais aqui em cima (pedido explícito) */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 0.6, ease: "easeOut" }} className="text-center">
          <p className="font-mono text-xs uppercase tracking-wide" style={{ color: accent }}>
            Orçamento
          </p>
        </motion.div>

        <div className="mx-auto mt-10 border-t border-white/10" />

        {/* B — O que está incluso: visual, ícone por papel de equipe */}
        <div className="mt-10">
          <p className="font-mono text-xs uppercase tracking-wide" style={{ color: accent }}>
            O que está incluso
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {configurator.teamRoles.map((member, index) => {
              const Icon = TEAM_ROLE_ICON[member.role];
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.5, delay: index * 0.06, ease: "easeOut" }}
                  className="flex flex-col items-center gap-2.5 rounded-xl border border-white/10 px-3 py-5 text-center"
                >
                  <Icon className="size-4" style={{ color: accent }} />
                  <span className="text-xs leading-snug text-white/70">{member.label}</span>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-white/10 p-5">
            <div className="flex items-start gap-2.5 text-sm text-white/75">
              <Check className="mt-0.5 size-4 shrink-0" style={{ color: accent }} />
              {pad2(locations)} captações estratégicas em {pad2(locations)} locações
            </div>
            <div className="flex items-start gap-2.5 text-sm text-white/75">
              <Check className="mt-0.5 size-4 shrink-0" style={{ color: accent }} />
              {pad2(videosDelivered)} vídeos estratégicos entregues
            </div>
            {configurator.strategyNote && (
              <div className="flex items-start gap-2.5 text-sm text-white/75">
                <Check className="mt-0.5 size-4 shrink-0" style={{ color: accent }} />
                {configurator.strategyNote}
              </div>
            )}
            {configurator.paymentTerms && (
              <div className="flex items-start gap-2.5 text-sm text-white/75">
                <Check className="mt-0.5 size-4 shrink-0" style={{ color: accent }} />
                {configurator.paymentTerms}
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto mt-10 border-t border-white/10" />

        {/* C — Personalize seu pacote: adicionar/reduzir, preço unitário nunca aparece */}
        <div className="mt-10">
          <p className="font-mono text-xs uppercase tracking-wide" style={{ color: accent }}>
            Personalize seu pacote
          </p>
          <p className="mt-1 text-[13px] text-white/40">Ajuste o escopo do jeito que fizer mais sentido pro seu momento.</p>

          {configurator.addons.length > 0 && (
            <>
              <p className="mb-2.5 mt-6 text-[11px] uppercase tracking-wide text-white/35">Adicionar</p>
              <div className="flex flex-col gap-2.5">
                {configurator.addons.map((addon) => (
                  <div key={addon.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 px-4 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-white">{addon.label}</span>
                      <span className="text-xs text-white/40">{addon.sublabel}</span>
                    </div>
                    <Stepper value={addonQty[addon.id] ?? 0} min={0} max={addon.max} accent={accent} onChange={(next) => setAddonQty((prev) => ({ ...prev, [addon.id]: next }))} />
                  </div>
                ))}
              </div>
            </>
          )}

          {(configurator.removables.length > 0 || videoRange) && (
            <>
              <p className="mb-2.5 mt-7 text-[11px] uppercase tracking-wide text-white/35">Reduzir</p>
              <div className="flex flex-col gap-2.5">
                {configurator.removables.map((removable) => (
                  <div key={removable.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 px-4 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-white">{removable.label}</span>
                      <span className="text-xs text-white/40">{removable.sublabel}</span>
                    </div>
                    <Toggle on={removableOn[removable.id] ?? removable.defaultOn} accent={accent} onChange={(next) => setRemovableOn((prev) => ({ ...prev, [removable.id]: next }))} />
                  </div>
                ))}
                {videoRange && (
                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 px-4 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-white">{videoRange.label}</span>
                      <span className="text-xs text-white/40">{videoRange.sublabel}</span>
                    </div>
                    <Stepper value={videoCount} min={videoRange.min} max={videoRange.max} accent={accent} onChange={setVideoCount} />
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="mx-auto mt-10 border-t border-white/10" />

        {/* D — o valor, por último (pedido explícito: "deve aparecer por último lá embaixo") —
            revelado depois de mostrar o que está incluso e a chance de personalizar, não como
            abertura. Atualiza ao vivo com as escolhas de "Personalize seu pacote" acima. */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 0.6, ease: "easeOut" }} className="mt-10 flex flex-col items-center text-center">
          <p className="font-mono text-xs uppercase tracking-wide text-white/40">Investimento</p>
          <p className="mt-3 font-mono text-6xl font-medium tabular-nums text-white sm:text-7xl">
            <span className="mr-1 text-3xl font-normal text-white/50">R$</span>
            {total.toLocaleString("pt-BR")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
