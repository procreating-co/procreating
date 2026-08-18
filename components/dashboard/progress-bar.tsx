import { Progress } from "@/components/ui/progress";

/** Barra de progresso com label + texto à direita — usada pro ritmo da meta mensal no header do
 *  Dashboard. `percentage` já vem pronto (0–100) de quem calcula (nunca calculado aqui, pra não
 *  duplicar a regra de "realizado / meta" em dois lugares). `rightLabel` — pedido explícito: o
 *  número à direita repetia a mesma porcentagem que já está no `label` ("62,1% da meta mensal
 *  62,1%"); virou texto livre (quem chama decide o quê — dias restantes, etc.), não mais
 *  derivado automaticamente de `percentage`. */
export function ProgressBar({ label, percentage, rightLabel }: { label: string; percentage: number; rightLabel: string }) {
  const clamped = Math.min(100, Math.max(0, percentage));
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono tabular-nums text-foreground">{rightLabel}</span>
      </div>
      <Progress value={clamped} />
    </div>
  );
}
