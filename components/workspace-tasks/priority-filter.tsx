import type { TaskPriority } from "@/lib/supabase/types/database";

/**
 * Filtro por cor (pedido explícito) — reaproveita `priority` (`low|medium|high`), campo que já
 * existe no schema desde a Task Intelligence mas nunca tinha UI nenhuma pra defini-lo ou lê-lo
 * (sempre `null`). Cores são as MESMAS de sempre (`--danger`/`--warning`/`--info`,
 * `lib/dashboard/metric-tone.ts`), nunca uma paleta nova — alta=urgente (danger), média=atenção
 * (warning), baixa=tranquila (info), a mesma leitura universal de "prioridade por cor".
 */
export const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "high", label: "Alta" },
  { value: "medium", label: "Média" },
  { value: "low", label: "Baixa" },
];

export const PRIORITY_LABEL: Record<TaskPriority, string> = { high: "Alta", medium: "Média", low: "Baixa" };

export const PRIORITY_DOT_CLASS: Record<TaskPriority, string> = {
  high: "bg-danger",
  medium: "bg-warning",
  low: "bg-info",
};

export type PriorityFilterValue = TaskPriority | "all";

/** Chips "Todas / Alta / Média / Baixa" — filtro client-side (a lista já está toda carregada),
 *  sem round-trip nenhum. Minimalista: só o ponto de cor + texto, mesmo padrão de tamanho/peso
 *  dos outros rótulos `text-xs uppercase tracking-wide` da tela. */
export function PriorityFilterBar({ value, onChange }: { value: PriorityFilterValue; onChange: (next: PriorityFilterValue) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange("all")}
        className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${value === "all" ? "border-foreground/30 bg-foreground/[0.06] text-foreground" : "border-border/60 text-muted-foreground hover:text-foreground"}`}
      >
        Todas
      </button>
      {PRIORITY_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(value === option.value ? "all" : option.value)}
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors ${value === option.value ? "border-foreground/30 bg-foreground/[0.06] text-foreground" : "border-border/60 text-muted-foreground hover:text-foreground"}`}
        >
          <span className={`size-1.5 shrink-0 rounded-full ${PRIORITY_DOT_CLASS[option.value]}`} aria-hidden="true" />
          {option.label}
        </button>
      ))}
    </div>
  );
}
