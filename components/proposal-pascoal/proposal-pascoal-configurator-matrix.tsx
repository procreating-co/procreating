"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Lock, Pencil } from "lucide-react";
import type { PascoalProposalContent, PerfilId, VideoCadence } from "@/lib/pascoal-proposal/types";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export type MatrixSelection = {
  perfis: PerfilId[];
  videos: VideoCadence;
  editing: boolean;
};

function findPrice(content: PascoalProposalContent, perfilCount: 1 | 2, videos: VideoCadence): number | undefined {
  return content.configurator.content.matrixPrices.find((p) => p.perfilCount === perfilCount && p.videos === videos)?.price;
}

/**
 * Etapa 1 do configurador — Plano de Posicionamento. Nada pré-selecionado: o cliente ativa
 * Pascoal Zona Sul e/ou Pascoal Zona Norte (toggle independente, não contador). A Julia aparece
 * travada — clicar nela dispara a transição pro Plano Completo (não é "mais um item da lista").
 * Com 2 perfis ativos, a cadência de vídeo fica fixa em 4/perfil (2×8 não é oferecido — ver
 * memória de cálculo em content/clients/pascoal/proposal.ts). Etapa respondida colapsa num
 * resumo de uma linha.
 */
export function ProposalPascoalConfiguratorMatrix({
  content,
  accent,
  selection,
  onChange,
  onSelectPlanoCompleto,
}: {
  content: PascoalProposalContent;
  accent: string;
  selection: MatrixSelection;
  onChange: (next: MatrixSelection) => void;
  onSelectPlanoCompleto: () => void;
}) {
  const { content: contentStep } = content.configurator;
  const answered = selection.perfis.length > 0;
  const perfilCount = selection.perfis.length as 0 | 1 | 2;
  const videos = perfilCount === 2 ? 4 : selection.videos;
  const price = perfilCount > 0 ? findPrice(content, perfilCount as 1 | 2, videos) : undefined;

  const togglePerfil = (id: PerfilId) => {
    const isActive = selection.perfis.includes(id);
    let nextPerfis: PerfilId[];
    if (isActive) {
      nextPerfis = selection.perfis.filter((p) => p !== id);
    } else if (selection.perfis.length >= 2) {
      return; // matriz normal para em 2 — o 3º é a Julia, tratada à parte
    } else {
      nextPerfis = [...selection.perfis, id];
    }
    // 2 perfis força vídeo=4 (única combinação oferecida)
    const nextVideos = nextPerfis.length === 2 ? 4 : selection.videos;
    onChange({ ...selection, perfis: nextPerfis, videos: nextVideos });
  };

  const summaryLine = answered
    ? `${contentStep.moduleLabel} — ${perfilCount === 1 ? "01 Oficina" : "02 Oficinas"} × ${videos.toString().padStart(2, "0")} vídeos ✓ ${price !== undefined ? currency.format(price) : ""}/mês`
    : "";

  if (answered && !selection.editing) {
    return (
      <button
        type="button"
        onClick={() => onChange({ ...selection, editing: true })}
        className="flex w-full items-center justify-between gap-4 border px-5 py-4 text-left transition-colors duration-300 sm:px-6"
        style={{ borderColor: `${accent}50` }}
      >
        <span className="flex items-center gap-3 text-sm text-white/85">
          <Check className="size-4 shrink-0" style={{ color: accent }} />
          {summaryLine}
        </span>
        <span className="flex shrink-0 items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-white/40">
          <Pencil className="size-3" /> Editar
        </span>
      </button>
    );
  }

  return (
    <div className="border border-white/10 p-5 sm:p-6">
      <p className="mb-4 text-sm text-white/55">{contentStep.moduleBenefit}</p>

      <p className="mb-2.5 font-mono text-[10px] uppercase tracking-wide text-white/35">Escolha os perfis</p>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {contentStep.perfis.map((perfil) => {
          if (perfil.exclusiveToCompleto) {
            return (
              <button
                key={perfil.id}
                type="button"
                onClick={onSelectPlanoCompleto}
                className="group flex flex-col items-start gap-1.5 border border-dashed border-white/15 px-4 py-3.5 text-left opacity-50 transition-opacity duration-300 hover:opacity-80"
              >
                <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-white/40">
                  <Lock className="size-3" /> Disponível apenas no Plano Completo
                </span>
                <span className="text-sm text-white/70">{perfil.name}</span>
              </button>
            );
          }

          const isActive = selection.perfis.includes(perfil.id);
          return (
            <button
              key={perfil.id}
              type="button"
              onClick={() => togglePerfil(perfil.id)}
              aria-pressed={isActive}
              className="flex flex-col items-start gap-1.5 border px-4 py-3.5 text-left transition-all duration-200"
              style={{ borderColor: isActive ? accent : "rgba(255,255,255,0.12)", backgroundColor: isActive ? `${accent}14` : "transparent" }}
            >
              <span
                className="flex size-5 shrink-0 items-center justify-center rounded-full border transition-all duration-200"
                style={{ backgroundColor: isActive ? accent : "transparent", borderColor: isActive ? accent : "rgba(255,255,255,0.25)" }}
              >
                {isActive && <Check className="size-3 text-black" />}
              </span>
              <span className="text-sm" style={{ color: isActive ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.7)" }}>
                {perfil.name}
              </span>
              <span className="text-xs text-white/35">{perfil.description}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence initial={false}>
        {perfilCount > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
            <div className="mt-5 border-t border-white/10 pt-5">
              {perfilCount === 1 ? (
                <>
                  <p className="mb-2.5 font-mono text-[10px] uppercase tracking-wide text-white/35">Vídeos mensais por perfil</p>
                  <div className="grid grid-cols-2 gap-2">
                    {contentStep.videoOptions.map((option) => {
                      const isSelected = option.value === selection.videos;
                      const optionPrice = findPrice(content, 1, option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => onChange({ ...selection, videos: option.value })}
                          aria-pressed={isSelected}
                          className="flex flex-col items-center gap-1 rounded-md border py-3 text-center transition-all duration-200"
                          style={{ borderColor: isSelected ? accent : "rgba(255,255,255,0.12)", backgroundColor: isSelected ? accent : "transparent" }}
                        >
                          <span className="text-xs font-medium" style={{ color: isSelected ? "black" : "rgba(255,255,255,0.7)" }}>
                            {option.label}
                          </span>
                          <span className="font-mono text-[11px]" style={{ color: isSelected ? "black" : "rgba(255,255,255,0.4)" }}>
                            {optionPrice !== undefined ? `${currency.format(optionPrice)}/mês` : ""}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p className="text-xs leading-relaxed text-white/40">Com 02 Oficinas, a cadência fica em 04 vídeos por perfil — o equilíbrio ideal de investimento para essa estrutura.</p>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                <p className="text-xs text-white/50">
                  {perfilCount === 1 ? "01 Oficina" : "02 Oficinas"} × {videos.toString().padStart(2, "0")} vídeos — {(perfilCount * videos).toString().padStart(2, "0")} vídeos/mês
                </p>
                {price !== undefined && (
                  <button
                    type="button"
                    onClick={() => onChange({ ...selection, editing: false })}
                    className="rounded-full px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-wide text-black transition-transform duration-200 hover:scale-105"
                    style={{ backgroundColor: accent }}
                  >
                    Confirmar — {currency.format(price)}/mês
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
