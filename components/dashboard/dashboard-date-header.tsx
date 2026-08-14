"use client";

import { useEffect, useState } from "react";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import type { GoalProgress } from "@/lib/dashboard/executive-metrics";

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

export function DashboardDateHeader({ goal }: { goal: GoalProgress | null }) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    setLabel(todayLabel());
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-3xl">{label ?? " "}</h1>
      {goal ? (
        <div className="max-w-md">
          <ProgressBar label={`${goal.percentage.toFixed(1)}% da meta mensal`} percentage={goal.percentage} />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Meta mensal não definida — configure em Settings → General.</p>
      )}
    </div>
  );
}
