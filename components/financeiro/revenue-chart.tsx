"use client";

import Link from "next/link";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TooltipContentProps } from "recharts";
import { useChartColors } from "@/lib/charts/colors";
import type { MonthlyEvolutionPoint } from "@/lib/financeiro/types";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/** Tooltip customizado — "quero saber de qual cliente está vindo" (pedido explícito): o tooltip
 *  padrão do Recharts só mostra o total da série (Receita/Despesas); este lê `revenueByClient`
 *  (já vem pronto, calculado em `computeFinanceiroMetrics`) e lista cada cliente que contribuiu
 *  pro mês, maior primeiro. Despesas continuam só com o total (não têm breakdown por cliente —
 *  não fazem sentido ter, são categorias, não clientes). */
function EvolutionTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload as MonthlyEvolutionPoint;

  return (
    <div className="min-w-[200px] rounded-lg border border-border bg-popover p-3 text-xs text-popover-foreground shadow-lg">
      <p className="mb-2 font-medium">{label}</p>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Receita</span>
          <span className="tabular-nums font-medium">{currencyFormatter.format(point.revenue)}</span>
        </div>
        {point.revenueByClient.length > 0 && (
          <div className="flex flex-col gap-1 border-t border-border/60 pt-1.5 pl-2">
            {point.revenueByClient.map((entry) =>
              entry.clientId ? (
                <Link
                  key={entry.clientId}
                  href={`/clientes/${entry.clientId}`}
                  className="flex items-center justify-between gap-4 text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                  title="Ver quanto já foi faturado com este cliente"
                >
                  <span className="truncate">{entry.clientName}</span>
                  <span className="tabular-nums shrink-0">{currencyFormatter.format(entry.amount)}</span>
                </Link>
              ) : (
                <div key={entry.clientName} className="flex items-center justify-between gap-4 text-muted-foreground">
                  <span className="truncate">{entry.clientName}</span>
                  <span className="tabular-nums shrink-0">{currencyFormatter.format(entry.amount)}</span>
                </div>
              ),
            )}
          </div>
        )}
        <div className="flex items-center justify-between gap-4 border-t border-border/60 pt-1.5">
          <span className="text-muted-foreground">Despesas</span>
          <span className="tabular-nums font-medium">{currencyFormatter.format(point.expenses)}</span>
        </div>
      </div>
    </div>
  );
}

export function RevenueChart({ data, height = 280 }: { data: MonthlyEvolutionPoint[]; height?: number }) {
  // Duas séries na MESMA escala (R$) — não é eixo duplo, é identidade categórica dentro da rampa
  // monocromática já usada no resto do app (ver lib/charts/colors.ts): receita no tom mais claro,
  // despesa no mais escuro. Não usa vermelho/verde de status — "despesa" não é um estado de erro.
  const { sequential } = useChartColors();
  const REVENUE_COLOR = sequential[0];
  const EXPENSES_COLOR = sequential[3];

  return (
    <div className="w-full" style={{ height }}>
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
          {/* `wrapperStyle: pointerEvents: "auto"` — o default do Recharts é 'none' (deixa o mouse
           *  "atravessar" o tooltip pro chart embaixo); sem isso os links de cliente dentro dele
           *  nunca recebem o clique. */}
          <Tooltip content={EvolutionTooltip} cursor={{ stroke: "var(--border)", strokeWidth: 1 }} wrapperStyle={{ pointerEvents: "auto" }} />
          <Legend wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }} />
          <Area type="monotone" dataKey="revenue" name="Receita" stroke={REVENUE_COLOR} strokeWidth={2} fill="url(#revenueFill)" />
          <Area type="monotone" dataKey="expenses" name="Despesas" stroke={EXPENSES_COLOR} strokeWidth={2} fill="url(#expensesFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
