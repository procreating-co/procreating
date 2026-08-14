import type { ReactNode } from "react";

/** Título + descrição + ações — o padrão repetido no topo de toda página interna
 *  (`<h1 className="font-display text-3xl">`...). Um componente só, sem forçar migração
 *  imediata das páginas que já têm esse bloco escrito à mão. */
export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl">{title}</h1>
        {description && <p className="max-w-lg text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
