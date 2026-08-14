/**
 * Tom semântico compartilhado por `MetricCard` e `StatTile` — mesma família de tokens do resto
 * do produto (`--brand`/`--success`/`--warning`/`--danger`/`--info`, `app/globals.css`), nunca
 * uma cor nova. Cada card pega o tom que já corresponde ao que o número REPRESENTA (receita =
 * info, saldo positivo = success, atrasado = danger...), não decorativo — cor por categoria dá
 * uma referência visual imediata sem precisar ler o texto pra saber do que se trata. Um lugar só
 * pra essa tabela evita as duas cópias divergirem.
 */
export type MetricTone = "brand" | "success" | "warning" | "danger" | "info" | "neutral";

export const METRIC_TONE_ICON_CLASS: Record<MetricTone, string> = {
  brand: "bg-brand/15 text-brand",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
  info: "bg-info/15 text-info",
  neutral: "bg-foreground/10 text-foreground",
};
