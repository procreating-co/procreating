"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

/**
 * Valores são mock — não há dados reais ainda. Por isso todo tile carrega a etiqueta "Demo"
 * de forma visível, em vez de aparentar ser um número real da operação.
 */
export function StatTile({
  icon,
  label,
  value,
  delay = 0,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  delay?: number;
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
        <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
          Demo
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </motion.div>
  );
}
