import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Versão compacta de estado vazio — Fase B (redesign). Pra dentro de um contexto menor (uma
 * coluna do Kanban, uma seção dentro de uma tela que já tem outras coisas) — sem o padding de
 * página inteira nem selo de marca do `EmptyState`, só ícone pequeno neutro + texto.
 */
export function EmptyInline({ icon: Icon, label, className }: { icon: LucideIcon; label: string; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-2 rounded-lg py-7 text-center text-xs text-muted-foreground/70", className)}>
      <div className="flex size-7 items-center justify-center rounded-md bg-foreground/[0.06] text-muted-foreground">
        <Icon className="size-3.5" />
      </div>
      {label}
    </div>
  );
}
