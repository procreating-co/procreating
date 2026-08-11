"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Lock } from "lucide-react";
import type { PascoalProposalContent } from "@/lib/pascoal-proposal/types";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/**
 * Plano Completo — não é "mais uma linha da matriz", é um produto à parte. Substitui a matriz
 * normal inteira quando ativo (a UI não soma um item na conta, ela troca de contexto). Rateio
 * mostrado por perfil, nunca como "R$7.000 ÷ 3" — e nunca chamado de "promoção".
 */
export function ProposalPascoalConfiguratorCompleto({ content, accent, onBack }: { content: PascoalProposalContent; accent: string; onBack: () => void }) {
  const { planoCompleto } = content.configurator.content;
  const rateio = Math.round(planoCompleto.price / 3 / 100) * 100;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="border-2 p-6 sm:p-8" style={{ borderColor: accent }}>
      <button type="button" onClick={onBack} className="mb-6 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-white/40 transition-colors hover:text-white/70">
        <ArrowLeft className="size-3.5" /> Voltar à configuração por oficina
      </button>

      <div className="flex items-center gap-2">
        <Sparkles className="size-4" style={{ color: accent }} />
        <span className="font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: accent }}>
          {planoCompleto.headline}
        </span>
      </div>
      <h3 className="mt-3 text-balance font-display text-2xl text-white sm:text-3xl">{planoCompleto.sectionTitle}</h3>
      <p className="mt-3 max-w-xl text-balance text-sm leading-relaxed text-white/60">{planoCompleto.description}</p>
      <p className="mt-1 text-xs text-white/35">{planoCompleto.conditionNote}</p>

      {/* Os 3 perfis, cada um com "dono" próprio */}
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {planoCompleto.perfis.map((perfil) => (
          <div key={perfil.id} className="border border-white/10 px-4 py-4" style={perfil.exclusiveToCompleto ? { borderColor: `${accent}60`, backgroundColor: `${accent}0a` } : undefined}>
            {perfil.exclusiveToCompleto && (
              <span className="mb-2 inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wide" style={{ color: accent }}>
                <Lock className="size-2.5" /> Exclusivo Plano Completo
              </span>
            )}
            <p className="text-sm text-white/90">{perfil.name}</p>
            <p className="mt-1 text-xs leading-relaxed text-white/45">{perfil.description}</p>
          </div>
        ))}
      </div>

      {/* Produção, tráfego, aquisição */}
      <div className="mt-8 grid grid-cols-1 gap-6 border-t border-white/10 pt-8 sm:grid-cols-2">
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-wide text-white/35">Produção inclusa</p>
          <p className="text-sm text-white/75">{planoCompleto.videosNote}</p>
        </div>
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-wide text-white/35">Tráfego pago incluso</p>
          <p className="text-sm text-white/75">{planoCompleto.trafficFollowersNote}</p>
          <p className="mt-1 text-xs text-white/45">{planoCompleto.trafficLeadsNote}</p>
        </div>
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-wide text-white/35">Investimento em mídia</p>
          <p className="text-sm text-white/75">{currency.format(planoCompleto.mediaInvestment)}/mês recomendado</p>
          <p className="mt-1 text-xs text-white/40">{planoCompleto.mediaNote}</p>
        </div>
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-wide text-white/35">Aquisição</p>
          <p className="text-sm text-white/75">{planoCompleto.acquisitionNote}</p>
        </div>
      </div>

      {/* Rateio por perfil — nunca "÷3" explícito */}
      <div className="mt-8 flex flex-col items-center border-t border-white/10 pt-8 text-center">
        <p className="font-mono text-xs uppercase tracking-wide text-white/40">Investimento por perfil</p>
        <p className="mt-2 font-display text-3xl text-white">≈ {currency.format(rateio)}<span className="text-base font-normal text-white/40">/mês</span></p>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-wide text-white/35">{planoCompleto.rateioNote}</p>
        <p className="mt-1 font-display text-xl text-white">{currency.format(planoCompleto.price)}<span className="text-sm font-normal text-white/40">/mês</span></p>
      </div>
    </motion.div>
  );
}
