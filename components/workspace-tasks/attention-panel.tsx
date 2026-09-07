"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Banknote, Handshake, ListChecks, Wallet, X, type LucideIcon } from "lucide-react";
import { METRIC_TONE_ICON_CLASS } from "@/lib/dashboard/metric-tone";
import { EmptyInline } from "@/components/dashboard/empty-inline";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AttentionItem, AttentionKind } from "@/lib/workspace/queries";
import { todayISO } from "@/lib/date";

const KIND_ICON: Record<AttentionKind, LucideIcon> = {
  tasks: ListChecks,
  leads: Handshake,
  receivables: Banknote,
  payables: Wallet,
};

// Urgência em TEXTO, nunca só pela cor (pedido explícito de acessibilidade) — "danger" já é
// sempre algo vencido/atrasado nesta tela (ver `lib/workspace/queries.ts`), "warning" é o que
// ainda não venceu mas precisa de atenção em breve.
const TONE_URGENCY_LABEL: Record<"danger" | "warning", string> = { danger: "Urgente", warning: "Atenção" };

function dismissedStorageKey() {
  // Escopado ao dia (pedido explícito "dispensar") — um alerta dispensado hoje volta a aparecer
  // amanhã se a condição real continuar (nunca escondido pra sempre por engano); nenhuma tabela
  // nova, só uma preferência local de UI.
  return `workspace:dismissed-alerts:${todayISO()}`;
}

function readDismissed(): Set<AttentionKind> {
  try {
    const raw = localStorage.getItem(dismissedStorageKey());
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

/**
 * "Atenção agora" (redesign "clareza operacional", pedido explícito) — de lista de texto pra
 * cards clicáveis com ícone/contagem/urgência, cada um dispensável (esconde só por hoje, ver
 * `readDismissed` acima). Continua 100% dado real de `computeWorkspaceOverview` — nenhuma
 * categoria nova foi inventada (a lista de exemplos do pedido incluía "projetos bloqueados" e
 * "itens aguardando aprovação", que não existem no schema hoje — omitidos, não fabricados).
 */
export function AttentionPanel({ items }: { items: AttentionItem[] }) {
  const [dismissed, setDismissed] = useState<Set<AttentionKind>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDismissed(readDismissed());
    setHydrated(true);
  }, []);

  function dismiss(kind: AttentionKind) {
    setDismissed((prev) => {
      const next = new Set(prev).add(kind);
      try {
        localStorage.setItem(dismissedStorageKey(), JSON.stringify([...next]));
      } catch {
        // localStorage indisponível (modo privado etc.) — o dismiss só não sobrevive a um
        // refresh; não impede o clique de funcionar na sessão atual.
      }
      return next;
    });
  }

  // Antes de hidratar, mostra tudo (evita flash/mismatch SSR) — o `dismissed` real chega no
  // primeiro effect, um frame depois.
  const visible = hydrated ? items.filter((item) => !dismissed.has(item.kind)) : items;

  if (items.length === 0) {
    return <EmptyInline icon={AlertTriangle} label="Nada precisa de atenção agora." />;
  }

  if (visible.length === 0) {
    return <p className="text-sm text-muted-foreground">Tudo dispensado por hoje.</p>;
  }

  return (
    <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      <AnimatePresence initial={false}>
        {visible.map((item) => {
          const Icon = KIND_ICON[item.kind];
          return (
            <motion.li
              key={item.kind}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              className="group relative list-none rounded-xl border border-border/60 bg-card"
            >
              <Link href={item.href} className="flex items-start gap-3 rounded-xl p-4 pr-9 transition-colors hover:bg-foreground/[0.03]">
                <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", METRIC_TONE_ICON_CLASS[item.tone])}>
                  <Icon className="size-4" />
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className={cn("text-xs font-medium uppercase tracking-wide", item.tone === "danger" ? "text-danger" : "text-warning")}>{TONE_URGENCY_LABEL[item.tone]}</span>
                  <span className="text-sm leading-snug text-foreground">{item.label}</span>
                </span>
                <ArrowRight className="ml-auto size-4 shrink-0 self-center text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
              <button
                type="button"
                onClick={() => dismiss(item.kind)}
                aria-label={`Dispensar alerta: ${item.label}`}
                className="absolute right-2 top-2 rounded p-1 text-muted-foreground/60 opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
              >
                <X className="size-3.5" />
              </button>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
