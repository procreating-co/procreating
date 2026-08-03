"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

/**
 * `icon` recebe um elemento já renderizado (não o componente) pelo mesmo motivo do
 * `SectionCard`: este é um Client Component, e funções não atravessam a fronteira
 * Server → Client como prop.
 */
export function ModuleCard({
  icon,
  label,
  description,
  delay = 0,
}: {
  icon: ReactNode;
  label: string;
  description: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      className="group flex flex-col gap-4 rounded-xl border border-border/60 bg-card/40 p-5 transition-colors hover:border-border hover:bg-card/60"
    >
      <div className="flex items-center justify-between">
        <div className="flex size-9 items-center justify-center rounded-lg bg-foreground/10 text-foreground">
          {icon}
        </div>
        <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
          Em breve
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium">{label}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
}
