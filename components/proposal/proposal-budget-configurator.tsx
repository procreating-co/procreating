"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Check, Clapperboard, Minus, Plus, Sparkles, Video } from "lucide-react";
import { ProposalSectionHeader } from "@/components/proposal/proposal-section-header";
import type { BudgetConfigurator, BudgetContent, BudgetTeamRole } from "@/lib/comercial/proposal-content-types";

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

/**
 * Configurador de investimento — v4, pedido explícito: modelo virou "monte do zero" em vez de
 * "âncora alta que você reduz". `content.heroNumber` agora é o PISO mínimo de investimento (nunca
 * o total exibido fica abaixo disso, mesmo sem nenhum item adicionado) — não mais um valor
 * plausível pra mostrar de cara. `configurator.addons` são os itens que a pessoa soma (captação/
 * vídeo editado) — preço unitário nunca aparece em lugar nenhum (regra de sempre), só o total
 * final muda ao vivo. Nada disso é visível até o clique em "Personalizar orçamento": nem os
 * steppers, nem o total — pedido explícito ("só pode aparecer depois que eu clicar").
 */
export function ProposalBudgetConfigurator({ content, configurator, accent }: { content: BudgetContent; configurator: BudgetConfigurator; accent: string }) {
  const [revealed, setRevealed] = useState(false);
  const [addonQty, setAddonQty] = useState<Record<string, number>>({});

  const additionsTotal = configurator.addons.reduce((sum, a) => sum + (addonQty[a.id] ?? 0) * a.unitPrice, 0);
  const total = Math.max(content.heroNumber, additionsTotal);

  return (
    <section className="border-t border-white/10 bg-black px-6 py-24 text-white lg:px-12 lg:py-32">
      <div className="mx-auto max-w-2xl">
        {/* A — só o título "Orçamento", nada mais aqui em cima (pedido explícito). Mesma fonte/
            tamanho de "Roadmap do Projeto." (pedido explícito) — reaproveita o próprio
            `ProposalSectionHeader` usado por Roadmap, em vez de duplicar as classes. */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 0.6, ease: "easeOut" }}>
          <ProposalSectionHeader eyebrow="" heading="Orçamento" accent={accent} />
        </motion.div>

        <div className="mx-auto mt-10 border-t border-white/10" />

        {/* B — O que está incluso: só a composição de equipe, visual (sem lista de texto — pedido
            explícito removeu as linhas de captações/vídeos/estratégia/pagamento). */}
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
        </div>

        <div className="mx-auto mt-10 border-t border-white/10" />

        {/* C — Personalizar: escondido até o clique (pedido explícito) — nem os itens pra somar
            nem o total aparecem antes disso. Preço unitário nunca aparece (regra de sempre), só o
            total final. */}
        <div className="mt-10 flex min-h-[70vh] flex-col items-center justify-center text-center">
          <AnimatePresence mode="wait" initial={false}>
            {!revealed ? (
              <motion.button
                key="reveal"
                type="button"
                onClick={() => setRevealed(true)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="rounded-full px-8 py-4 text-sm font-medium transition-transform hover:scale-[1.02] active:scale-95"
                style={{ backgroundColor: accent, color: "black" }}
              >
                Personalizar orçamento
              </motion.button>
            ) : (
              <motion.div key="builder" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="w-full text-left">
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

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }} className="mt-14 flex flex-col items-center text-center">
                  <p className="font-mono text-xs uppercase tracking-wide text-white/40">Investimento</p>
                  <p className="mt-3 font-mono text-6xl font-medium tabular-nums text-white sm:text-7xl">
                    <span className="mr-1 text-3xl font-normal text-white/50">R$</span>
                    {total.toLocaleString("pt-BR")}
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
