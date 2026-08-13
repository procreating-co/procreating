"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

/**
 * `demo` (default `true`) mostra a etiqueta "Demo" — era hardcoded até a Fase 2-5 (Comercial/
 * Financeiro/Onboarding), quando o primeiro dado REAL passou a alimentar este componente
 * (Estratégias, Financeiro, Home). Default `true` preserva o comportamento de toda tela que
 * ainda lê de `lib/dashboard/demo-data.ts` sem precisar tocar em cada call site; quem já tem
 * dado real passa `demo={false}` explicitamente — nunca implícito.
 */
export function StatTile({
  icon,
  label,
  value,
  delay = 0,
  demo = true,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  delay?: number;
  demo?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card/40 p-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex size-9 items-center justify-center rounded-lg bg-foreground/10 text-foreground">
          {icon}
        </div>
        {demo && (
          <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
            Demo
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </motion.div>
  );
}
