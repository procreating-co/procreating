"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useChartColors } from "@/lib/charts/colors";
import type { HeatmapDay } from "@/lib/gamification/queries";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

/** count=0 fica com `bg-muted` (classe, não a rampa); 1..3+ mapeia pra 4 degraus da rampa
 *  sequencial, do mais discreto (`sequential[3]`) ao mais intenso (`sequential[0]`, sempre o mais
 *  "presente" da rampa, em ambos os temas — ver `lib/charts/colors.ts`). */
function bucketIndex(count: number): number {
  if (count <= 1) return 3;
  if (count <= 3) return 2;
  if (count <= 5) return 1;
  return 0;
}

/**
 * Grade semana×dia estilo GitHub — cor pela rampa monocromática de `useChartColors().sequential`,
 * nunca a rampa verde tradicional (paleta é deliberadamente monocromática fora dos tokens de
 * status). Começa vazio de verdade (tabelas novas, sem histórico nenhum) e vai preenchendo com uso
 * real — nunca simula histórico.
 */
export function ActivityHeatmap({ days }: { days: HeatmapDay[] }) {
  const colors = useChartColors();
  const hasAnyActivity = days.some((day) => day.count > 0);

  const weeks = useMemo(() => {
    const result: HeatmapDay[][] = [];
    for (let i = 0; i < days.length; i += 7) result.push(days.slice(i, i + 7));
    return result;
  }, [days]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1 overflow-x-auto pb-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${dateFormatter.format(new Date(`${day.date}T12:00:00Z`))} — ${day.count} ${day.count === 1 ? "evento" : "eventos"}`}
                className={cn("size-2.5 rounded-[2px]", day.count === 0 && "bg-muted")}
                style={day.count > 0 ? { backgroundColor: colors.sequential[bucketIndex(day.count)] } : undefined}
              />
            ))}
          </div>
        ))}
      </div>
      {!hasAnyActivity && <p className="text-xs text-muted-foreground">Nenhuma atividade registrada ainda — comece completando uma tarefa ou uma sessão de foco.</p>}
    </div>
  );
}
