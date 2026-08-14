"use client";

import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useChartColors } from "@/lib/charts/colors";
import type { MonthlyEvolutionPoint } from "@/lib/financeiro/types";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export function RevenueChart({ data }: { data: MonthlyEvolutionPoint[] }) {
  // Duas séries na MESMA escala (R$) — não é eixo duplo, é identidade categórica dentro da rampa
  // monocromática já usada no resto do app (ver lib/charts/colors.ts): receita no tom mais claro,
  // despesa no mais escuro. Não usa vermelho/verde de status — "despesa" não é um estado de erro.
  const { sequential } = useChartColors();
  const REVENUE_COLOR = sequential[0];
  const EXPENSES_COLOR = sequential[3];

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={REVENUE_COLOR} stopOpacity={0.35} />
              <stop offset="100%" stopColor={REVENUE_COLOR} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expensesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={EXPENSES_COLOR} stopOpacity={0.35} />
              <stop offset="100%" stopColor={EXPENSES_COLOR} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.5} />
          <XAxis dataKey="month" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
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
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }} />
          <Area type="monotone" dataKey="revenue" name="Receita" stroke={REVENUE_COLOR} strokeWidth={2} fill="url(#revenueFill)" />
          <Area type="monotone" dataKey="expenses" name="Despesas" stroke={EXPENSES_COLOR} strokeWidth={2} fill="url(#expensesFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
