import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Achado real (pedido explícito — "o bloco de marcar que está feito está em branco e não está
 * legal"): `<input type="checkbox">` cru não pode ser recolorido de verdade via classe Tailwind —
 * o quadrado em si (fundo/borda quando desmarcado) é desenhado pelo SO/navegador, então mesmo com
 * `border-input` aplicado, a maioria dos navegadores continua pintando um quadrado claro/branco
 * por cima do card escuro. Fix: `role="checkbox"` num `<button>` normal, 100% desenhado por nós
 * (mesmos tokens cinza do resto do card — `border-border`/`bg-muted`), com o ícone de check só
 * aparecendo quando marcado. Reaproveitado por `workspace-tasks.tsx` e `week-view.tsx` — mesmo
 * defeito, mesmo fix, um componente só em vez de duplicar a marcação em dois arquivos.
 */
export function TaskCheckbox({
  checked,
  onToggle,
  label,
  disabled,
  size = "default",
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  disabled?: boolean;
  size?: "default" | "sm";
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "flex shrink-0 items-center justify-center rounded border transition-colors disabled:opacity-60",
        size === "sm" ? "mt-0.5 size-3.5" : "size-4",
        checked ? "border-border bg-muted text-foreground/70" : "border-border/60 bg-muted/40 text-transparent hover:border-border hover:bg-muted/70",
      )}
    >
      <Check className={size === "sm" ? "size-2.5" : "size-3"} />
    </button>
  );
}
