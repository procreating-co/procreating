"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { StatusDot, type StatusTone } from "@/components/dashboard/status-dot";
import { maskAmount } from "@/lib/financeiro/mask";
import { updateRevenueStatusAction } from "@/lib/financeiro/actions";
import type { FinancialEntryStatus } from "@/lib/supabase/types/database";
import type { RevenueExpectedEntry } from "@/lib/financeiro/types";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

const STATUS_TONE: Record<FinancialEntryStatus, StatusTone> = { pendente: "pending", pago: "active", atrasado: "danger", cancelado: "neutral" };
const STATUS_LABEL: Record<FinancialEntryStatus, string> = { pendente: "Pendente", pago: "Pago", atrasado: "Atrasado", cancelado: "Cancelado" };

/**
 * Detalhe de "Receita Esperada" — pedido explícito: "clicar ao lado do nome informando que o
 * cliente pagou". Clique alterna pago ↔ pendente/atrasado (volta pro status anterior, pra
 * corrigir engano — nunca fica preso em "pago" sem saída) usando a mesma `updateRevenueStatusAction`
 * de sempre (nenhuma action nova). Só entra em "Receita do Mês" quando `status === "pago"`
 * (`lib/financeiro/queries.ts`) — daí o nome "esperada": aqui lista tudo que se espera receber
 * este mês, pago ou não.
 */
export function RevenueExpectedList({ entries, canView }: { entries: RevenueExpectedEntry[]; canView: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum lançamento com vencimento este mês.</p>;
  }

  function toggle(entry: RevenueExpectedEntry) {
    const nextStatus: FinancialEntryStatus = entry.status === "pago" ? "pendente" : "pago";
    startTransition(async () => {
      await updateRevenueStatusAction(entry.id, nextStatus);
      router.refresh();
    });
  }

  return (
    <ul className="flex flex-col divide-y divide-border/60">
      {entries.map((entry) => (
        <li key={entry.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
          <div className="flex flex-col gap-0.5">
            <span className="font-medium">{entry.clientName}</span>
            <span className="text-xs text-muted-foreground">{entry.description}</span>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="tabular-nums text-muted-foreground">{currencyFormatter.format(maskAmount(entry.amount, !canView))}</span>
            {canView ? (
              <button
                type="button"
                onClick={() => toggle(entry)}
                disabled={isPending}
                aria-label={`Marcar ${entry.clientName} como ${entry.status === "pago" ? "não pago" : "pago"}`}
                className="disabled:opacity-60"
              >
                <StatusDot tone={STATUS_TONE[entry.status]} label={STATUS_LABEL[entry.status]} />
              </button>
            ) : (
              <StatusDot tone={STATUS_TONE[entry.status]} label={STATUS_LABEL[entry.status]} />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
