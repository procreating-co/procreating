import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Título pequeno + descrição opcional + ação à direita — o padrão que já se repetia inline em
 *  várias páginas (`<h2 className="text-xs font-medium uppercase ...">`), agora um componente
 *  só. */
export function SectionHeader({ title, description, action, className }: { title: string; description?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="flex flex-col gap-1">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
