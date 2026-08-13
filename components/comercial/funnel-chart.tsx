"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_SEQUENTIAL } from "@/lib/charts/colors";
import type { FunnelStep } from "@/lib/comercial/types";

/** Cor por posição no funil — mesma rampa sequencial monocromática de `lib/charts/colors.ts`,
 *  clara→escura (mais leads no topo, mais escuro/concentrado nas etapas finais). Índice
 *  interpolado pra caber os N passos do funil nos 5 tons disponíveis, sem repetir a mesma cor em
 *  passos adjacentes quando N ≤ 5 (funis normalmente têm 8 estágios "não perdidos"). */
function colorForStep(index: number, total: number): string {
  if (total <= 1) return CHART_SEQUENTIAL[0];
  const position = index / (total - 1);
  const rampIndex = Math.round(position * (CHART_SEQUENTIAL.length - 1));
  return CHART_SEQUENTIAL[rampIndex];
}

export function FunnelChart({ steps }: { steps: FunnelStep[] }) {
  const data = steps.map((step, index) => ({
    name: step.stage.label,
    count: step.count,
    conversion: step.conversionFromPrevious,
    fill: colorForStep(index, steps.length),
  }));

  return (
    <div className="flex flex-col gap-2">
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 4 }} barCategoryGap={10}>
            <CartesianGrid horizontal={false} stroke="var(--border)" strokeOpacity={0.5} />
            <XAxis type="number" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="name"
              width={140}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "var(--muted)", opacity: 0.3 }}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--popover-foreground)",
              }}
              formatter={(value, _name, item) => {
                const count = Number(value ?? 0);
                const conversion = (item?.payload as { conversion?: number | null } | undefined)?.conversion;
                return [`${count} lead${count === 1 ? "" : "s"}${conversion != null ? ` · ${(conversion * 100).toFixed(0)}% do passo anterior` : ""}`, ""];
              }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={28}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
              <LabelList dataKey="count" position="right" fill="var(--foreground)" fontSize={12} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
