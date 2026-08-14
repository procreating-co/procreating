import { Progress } from "@/components/ui/progress";

/** Barra de progresso com label + percentual — usada pro ritmo da meta mensal no header do
 *  Dashboard. `percentage` já vem pronto (0–100) de quem calcula (nunca calculado aqui, pra não
 *  duplicar a regra de "realizado / meta" em dois lugares). */
export function ProgressBar({ label, percentage }: { label: string; percentage: number }) {
  const clamped = Math.min(100, Math.max(0, percentage));
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono tabular-nums text-foreground">{clamped.toFixed(1)}%</span>
      </div>
      <Progress value={clamped} />
    </div>
  );
}
