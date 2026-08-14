"use client";

import { useState, type ReactNode } from "react";
import { Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Todo gráfico do Dashboard é clicável — abre ampliado, com mais espaço e (quando fizer
 * sentido) uma tabela dos números exatos por baixo (pedido explícito: "os gráficos todos são
 * clicáveis, ao clicar abre eles ampliados e com mais opções de filtragem e detalhes").
 * `children` é o gráfico compacto de sempre; `expanded` é o conteúdo do modal — normalmente o
 * mesmo componente de gráfico, só que mais alto, mais o seletor de período (quando o gráfico já
 * tiver um) e uma tabela de apoio.
 */
export function ChartExpandDialog({
  title,
  description,
  expanded,
  children,
  className,
}: {
  title: string;
  description?: string;
  expanded: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={cn("group relative w-full cursor-zoom-in text-left", className)}>
        {children}
        <span className="pointer-events-none absolute right-3 top-3 flex size-7 items-center justify-center rounded-md bg-card/80 text-muted-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
          <Maximize2 className="size-3.5" />
        </span>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          {expanded}
        </DialogContent>
      </Dialog>
    </>
  );
}
