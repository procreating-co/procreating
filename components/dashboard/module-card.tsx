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
 * informativo ("Em breve").
 */
export function ModuleCard({
  icon,
  label,
  description,
  delay = 0,
  href,
}: {
  icon: ReactNode;
  label: string;
  description: string;
  delay?: number;
  href?: string;
}) {
  const cardClassName = cn(
    "group flex flex-col gap-4 rounded-xl border border-border/60 bg-card/40 p-5 transition-colors",
    href ? "hover:border-border hover:bg-card/70" : "hover:border-border hover:bg-card/60",
  );

  const content = (
    <>
      <div className="flex items-center justify-between">
        <div className="flex size-9 items-center justify-center rounded-lg bg-foreground/10 text-foreground">
          {icon}
        </div>
        {href ? (
          <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
        ) : (
          <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
            Em breve
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium">{label}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
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
          {content}
        </Link>
      ) : (
        <div className={cardClassName}>{content}</div>
      )}
    </motion.div>
  );
}
