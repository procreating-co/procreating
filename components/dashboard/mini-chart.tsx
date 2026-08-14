"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { useChartColors } from "@/lib/charts/colors";
import { cn } from "@/lib/utils";

/**
 * Sparkline compacto — sem eixo, sem grade, sem tooltip (é um resumo visual dentro de um
 * `MetricCard`, não um gráfico pra analisar). `tone` escolhe a cor: `"brand"` (padrão, neutro) ou
 * um estado (`positive`/`danger`/`info`) quando o sparkline representa algo que já tem um sinal
 * claro de sentido (ex.: queda de receita = vermelho).
 */
export function MiniChart({
  data,
  tone = "brand",
  className,
}: {
  data: number[];
  tone?: "brand" | "positive" | "danger" | "info";
  className?: string;
}) {
  const colors = useChartColors();
  if (data.length < 2) return null;

  const color = tone === "brand" ? colors.brand : colors.status[tone];
  const points = data.map((value, index) => ({ index, value }));

  return (
    <div className={cn("h-10 w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`mini-chart-${tone}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} fill={`url(#mini-chart-${tone})`} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
