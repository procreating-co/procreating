"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp } from "lucide-react";
import { MiniChart } from "@/components/dashboard/mini-chart";
import { cn } from "@/lib/utils";

export type MetricDelta = { value: string; direction: "up" | "down" };

/**
 * Evolução do `StatTile` (`stat-tile.tsx`, mantido como está pras telas que já o usam) — pro KPI
 * row do Dashboard executivo: mesmo esqueleto compacto, + slot de sparkline (`MiniChart`) e delta
 * sempre colorido por `--success`/`--danger` (nunca `--brand` — cor de estado é família
 * separada da cor de ação). Sem `demo`: se não há dado real, o caller passa `value="—"` e omite
 * `sparkline`/`delta`, nunca inventa um "0".
 */
export function MetricCard({
  icon,
  label,
  value,
  delta,
  sparkline,
  sparklineTone = "brand",
  delay = 0,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  delta?: MetricDelta;
  sparkline?: number[];
  sparklineTone?: "brand" | "positive" | "danger" | "info";
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
      className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">{icon}</span>
          {label}
        </div>
        {delta && (
          <span className={cn("flex items-center gap-0.5 font-mono text-[11px]", delta.direction === "up" ? "text-success" : "text-danger")}>
            {delta.direction === "up" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
            {delta.value}
          </span>
        )}
      </div>
      <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      {sparkline && sparkline.length >= 2 && <MiniChart data={sparkline} tone={sparklineTone} />}
    </motion.div>
  );
}
