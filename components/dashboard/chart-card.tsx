import type { ReactNode } from "react";
import { SectionHeader } from "@/components/dashboard/section-header";
import { cn } from "@/lib/utils";

/** Card padrão pros gráficos grandes do Dashboard (Revenue vs. Target, Cash Flow 6 meses, etc.)
 *  — `SectionHeader` embutido + área de conteúdo. Usa `EmptyState`/`EmptyInline` como `children`
 *  quando não há dado suficiente, em vez de renderizar um gráfico vazio. */
export function ChartCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-5 rounded-xl border border-border/60 bg-card p-5", className)}>
      <SectionHeader title={title} description={description} action={action} />
      {children}
    </div>
  );
}
