"use client";

import { Area, AreaChart, CartesianGrid, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useChartColors } from "@/lib/charts/colors";
import type { RevenueVsTargetPoint } from "@/lib/dashboard/executive-metrics";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/** Realizado (área) vs. ritmo esperado (linha) — dia a dia do mês corrente. "Ritmo esperado" =
 *  meta × (dia/dias do mês), a régua que responde "quanto deveríamos ter feito até aqui". */
export function RevenueVsTargetChart({ points }: { points: RevenueVsTargetPoint[] }) {
  const { brand, sequential } = useChartColors();
  const paceColor = sequential[2];

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="revenueVsTargetFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={brand} stopOpacity={0.25} />
              <stop offset="100%" stopColor={brand} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.5} />
          <XAxis dataKey="day" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value: number) => currencyFormatter.format(value)}
            width={72}
          />
          <Tooltip
            contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--popover-foreground)" }}
            formatter={(value) => currencyFormatter.format(Number(value ?? 0))}
            labelFormatter={(day) => `Dia ${day}`}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }} />
          <Area type="monotone" dataKey="realized" name="Realizado" stroke={brand} strokeWidth={2} fill="url(#revenueVsTargetFill)" connectNulls={false} />
          <Line type="monotone" dataKey="pace" name="Ritmo esperado" stroke={paceColor} strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
