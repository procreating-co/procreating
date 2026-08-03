"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * `icon` recebe um elemento já renderizado (não o componente) pelo mesmo motivo do
 * `SectionCard`: este é um Client Component, e funções não atravessam a fronteira
 * Server → Client como prop.
 *
 * `href` é opcional: quando presente (ex.: Clientes → `/clients`), o card vira um link real
 * para o módulo, que pode viver em outro sistema da plataforma. Sem `href`, o card é só
 * informativo ("Em breve"), com "Sem atividade ainda" no lugar da última ação e o botão
 * desabilitado visualmente — mesma estrutura de todo módulo, conectado ou não.
 */
export function ModuleCard({
  icon,
  label,
  description,
  delay = 0,
  href,
  actionLabel,
  lastAction,
}: {
  icon: ReactNode;
  label: string;
  description: string;
  delay?: number;
  href?: string;
  actionLabel?: string;
  lastAction?: { label: string; demo?: boolean };
}) {
  const cardClassName = cn(
    "group flex flex-col gap-5 rounded-xl border border-border/60 bg-card/40 p-5 transition-colors",
    href ? "hover:border-border hover:bg-card/70" : "hover:border-border hover:bg-card/60",
  );

  const body = (
    <>
      <div className="flex items-center justify-between">
        <div className="flex size-9 items-center justify-center rounded-lg bg-foreground/10 text-foreground">
          {icon}
        </div>
        <span
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide",
            href ? "border-emerald-400/25 text-emerald-300/90" : "border-border/60 text-muted-foreground",
          )}
        >
          <span className={cn("size-1.5 rounded-full", href ? "bg-emerald-400" : "bg-muted-foreground/50")} />
          {href ? "Conectado" : "Em breve"}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium">{label}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="flex flex-col gap-1.5 border-t border-border/60 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Última ação</span>
          {lastAction?.demo && <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70">Demo</span>}
        </div>
        <p className="text-sm text-muted-foreground">{lastAction?.label ?? "Sem atividade ainda"}</p>
      </div>

      <div className={cn("flex items-center gap-1.5 text-sm font-medium", href ? "text-foreground" : "text-muted-foreground/70")}>
        {actionLabel ?? "Em breve"}
        {href && <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />}
      </div>
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
    >
      {href ? (
        <Link href={href} className={cardClassName}>
          {body}
        </Link>
      ) : (
        <div className={cardClassName}>{body}</div>
      )}
    </motion.div>
  );
}
