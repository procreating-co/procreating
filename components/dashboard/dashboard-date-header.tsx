"use client";

import { useEffect, useState } from "react";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { GoalDetailDialog } from "@/components/dashboard/goal-detail-dialog";
import { formatMaskedCurrency } from "@/lib/financeiro/mask";
import type { DetailEntry, GoalProgress } from "@/lib/dashboard/executive-metrics";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** "Sexta, 13 de Agosto" — calculada no cliente (mesmo raciocínio de `greeting-header.tsx`: evita
 *  mismatch de hidratação de fuso horário entre servidor e cliente). Substitui "Bom dia,
 *  Santiago"/"Visão geral da operação". */
function todayLabel(): string {
  const now = new Date();
  const weekday = new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(now).split("-")[0];
  const month = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(now);
  return `${capitalize(weekday)}, ${now.getDate()} de ${capitalize(month)}`;
}

/** "Agosto 2026" — mesmo raciocínio de `todayLabel` (calculado no cliente, evita mismatch de
 *  fuso na hidratação). Título do `GoalDetailDialog`. */
function monthLabel(): string {
  const now = new Date();
  const month = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(now);
  return `${capitalize(month)} ${now.getFullYear()}`;
}

export function DashboardDateHeader({
  goal,
  canView,
  masked = false,
  revenueEntries,
}: {
  goal: GoalProgress | null;
  canView: boolean;
  /** `dev_tester` — pedido explícito: em vez de "R$ ••••", mostra o restante real × 3. */
  masked?: boolean;
  revenueEntries: DetailEntry[];
}) {
  const [label, setLabel] = useState<string | null>(null);
  const [month, setMonth] = useState<string | null>(null);

  useEffect(() => {
    setLabel(todayLabel());
    setMonth(monthLabel());
  }, []);

  // Pedido explícito, versão mais recente — volta a juntar % + R$ restante + dias restantes na
  // mesma linha (rodadas anteriores foram só % + R$, depois só % + dias; agora os 3 juntos):
  // "62,1% | R$11.360 para meta mensal" à esquerda, "Restam X dias" à direita. Nunca negativo
  // (meta já batida = 0 faltando, não "-R$X sobrando" — essa leitura pertence a outro bloco).
  const remaining = goal ? Math.max(0, goal.amount - goal.realized) : 0;
  const remainingLabel = canView ? currencyFormatter.format(remaining) : masked ? formatMaskedCurrency(remaining, true) : "R$ ••••";
  const daysLabel = goal ? (goal.daysRemaining === 1 ? "Resta 1 dia" : `Restam ${goal.daysRemaining} dias`) : "";

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-3xl">{label ?? " "}</h1>
      {goal ? (
        <GoalDetailDialog goal={goal} canView={canView} masked={masked} revenueEntries={revenueEntries} monthLabel={month ?? ""} className="max-w-md">
          <ProgressBar
            label={`${goal.percentage.toFixed(1)}% | ${remainingLabel} para meta mensal`}
            percentage={goal.percentage}
            rightLabel={daysLabel}
          />
        </GoalDetailDialog>
      ) : (
        <p className="text-sm text-muted-foreground">Meta mensal não definida — configure em Configurações → Geral.</p>
      )}
    </div>
  );
}
