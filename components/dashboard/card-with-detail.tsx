"use client";

import { useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Torna qualquer card do Dashboard clicável — abre um modal com a lista real por trás do
 * número (pedido explícito: "todo bloco/card deve ser clicável"). `children` é o card visual de
 * sempre (`MetricCard`, o bloco compacto, etc.), sem mudar nada nele; isto só embrulha num
 * `<button>` (reset de estilo, sem aparência de botão) + `Dialog`.
 */
export function CardWithDetail({
  title,
  description,
  detail,
  children,
  className,
}: {
  title: string;
  description?: ReactNode;
  detail: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "w-full cursor-pointer rounded-xl text-left outline-none transition-transform duration-150 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className,
        )}
      >
        {children}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          {detail}
        </DialogContent>
      </Dialog>
    </>
  );
}
