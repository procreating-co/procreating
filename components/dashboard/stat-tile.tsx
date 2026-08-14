"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp } from "lucide-react";
import { METRIC_TONE_ICON_CLASS, type MetricTone } from "@/lib/dashboard/metric-tone";
import { cn } from "@/lib/utils";

export type StatTrend = { value: string; direction: "up" | "down" };
export type StatTileTone = MetricTone;

/**
 * `demo` (default `true`) mostra a etiqueta "Demo" — era hardcoded até a Fase 2-5 (Comercial/
 * Financeiro/Onboarding), quando o primeiro dado REAL passou a alimentar este componente
 * (Estratégias, Financeiro, Home). Default `true` preserva o comportamento de toda tela que
 * ainda lê de `lib/dashboard/demo-data.ts` sem precisar tocar em cada call site; quem já tem
 * dado real passa `demo={false}` explicitamente — nunca implícito.
 *
 * Fase B (redesign): `featured` marca a métrica-âncora de uma tela (ex.: Receita este mês na
 * Home) com um wash sutil de marca — nem todo número pesa igual, e antes todos os tiles eram
 * visualmente idênticos. `trend` mostra variação vs. período anterior quando fizer sentido
 * comparar (nunca inventado — só passe quando o dado de comparação existir de verdade). `tone`
 * (novo) colore o ícone por significado quando o tile não é `featured` — ver `StatTileTone`.
 */
export function StatTile({
  icon,
  label,
  value,
  delay = 0,
  demo = true,
  featured = false,
  tone = "neutral",
  trend,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  delay?: number;
  demo?: boolean;
  featured?: boolean;
  tone?: StatTileTone;
  trend?: StatTrend;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      className={cn(
        "flex flex-col gap-4 rounded-xl border p-5",
        featured ? "border-brand-subtle-border bg-gradient-to-br from-brand-subtle to-card" : "border-border/60 bg-card/40",
      )}
    >
      <div className="flex items-center justify-between">
        <div className={cn("flex size-9 items-center justify-center rounded-lg", featured ? "bg-brand/20 text-brand" : METRIC_TONE_ICON_CLASS[tone])}>
          {icon}
        </div>
        {demo && (
          <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
            Demo
          </span>
        )}
        {!demo && trend && (
          <span className={cn("flex items-center gap-0.5 font-mono text-[11px]", trend.direction === "up" ? "text-success" : "text-danger")}>
            {trend.direction === "up" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
            {trend.value}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[28px] leading-none font-semibold tracking-tight tabular-nums">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </motion.div>
  );
}
