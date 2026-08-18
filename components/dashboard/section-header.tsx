import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Título pequeno + descrição opcional + ação à direita — o padrão que já se repetia inline em
 *  várias páginas (`<h2 className="text-xs font-medium uppercase ...">`), agora um componente
 *  só. `size="lg"` — pedido explícito (Comercial, virou página única: seções que eram abas
 *  próprias precisam da mesma fonte/tamanho do título da página, `PageHeader`, não do rótulo
 *  pequeno de sub-seção) — mesmo `font-display text-3xl` do `<h1>` de `PageHeader`, cor normal
 *  (não `muted-foreground`), sem versalete. Default continua `"sm"` (comportamento de sempre,
 *  inalterado em todo o resto do produto — só quem passar `size="lg"` explicitamente muda). */
export function SectionHeader({
  title,
  description,
  action,
  className,
  size = "sm",
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  size?: "sm" | "lg";
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="flex flex-col gap-1">
        <h2 className={size === "lg" ? "font-display text-3xl" : "text-xs font-medium uppercase tracking-wide text-muted-foreground"}>{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
