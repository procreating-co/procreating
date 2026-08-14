"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useChartColors } from "@/lib/charts/colors";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export type PipelineStageBar = { label: string; value: number; count: number };

/** Valor de pipeline aberto por estágio — mesma rampa sequencial monocromática do resto do
 *  produto (não é o `FunnelChart` de `comercial/`, que é sobre contagem/conversão de lead; este
 *  é sobre valor em R$ por estágio). */
export function SalesPipelineChart({ stages }: { stages: PipelineStageBar[] }) {
  const { sequential } = useChartColors();
  const data = stages.map((stage, index) => ({
    ...stage,
    fill: sequential[Math.min(index, sequential.length - 1)],
  }));

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 32, bottom: 4, left: 4 }} barCategoryGap={10}>
          <CartesianGrid horizontal={false} stroke="var(--border)" strokeOpacity={0.5} />
          <XAxis type="number" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => currencyFormatter.format(v)} />
          <YAxis type="category" dataKey="label" width={120} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.3 }}
            contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--popover-foreground)" }}
            formatter={(value, _name, item) => {
              const count = (item?.payload as PipelineStageBar | undefined)?.count ?? 0;
              return [`${currencyFormatter.format(Number(value ?? 0))} · ${count} lead${count === 1 ? "" : "s"}`, ""];
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={22}>
            {data.map((entry) => (
              <Cell key={entry.label} fill={entry.fill} />
            ))}
            <LabelList dataKey="value" position="right" formatter={(v: unknown) => currencyFormatter.format(Number((v as number) ?? 0))} fill="var(--foreground)" fontSize={11} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
