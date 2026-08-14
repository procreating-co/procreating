import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

/** Badge com ponto de status — o padrão novo pra estado de item de lista/tabela (substitui
 *  `status-dot.tsx` como referência daqui em diante; o antigo continua onde já está usado, sem
 *  forçar migração de tudo nesta fase). Cores só dos tokens semânticos, nunca `--brand`. */
export function StatusBadge({ tone, label }: { tone: StatusTone; label: string }) {
  const dotColor: Record<StatusTone, string> = {
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    info: "bg-info",
    neutral: "bg-muted-foreground/50",
  };

  return (
    <Badge variant={tone === "neutral" ? "default" : tone}>
      <span className={cn("size-1.5 rounded-full", dotColor[tone])} />
      {label}
    </Badge>
  );
}
