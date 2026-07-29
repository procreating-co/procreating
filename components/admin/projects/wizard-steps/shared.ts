import { cn } from "@/lib/utils";

/** Botão de opção segmentada (ex.: "Cliente existente" / "Novo cliente"). */
export function segmentedButtonClass(active: boolean) {
  return cn(
    "rounded-md border px-3 py-1.5 text-sm transition-colors",
    active
      ? "border-foreground/30 bg-foreground/10 text-foreground"
      : "border-border/60 text-muted-foreground hover:bg-foreground/5",
  );
}

/** Card selecionável estilo radio (cliente/template). */
export function radioCardClass(active: boolean) {
  return cn(
    "flex cursor-pointer flex-col items-start gap-1 rounded-md border px-4 py-3 text-sm transition-colors",
    active ? "border-foreground/30 bg-foreground/10" : "border-border/60 hover:bg-foreground/5",
  );
}

export const fileInputClass =
  "text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border/60 file:bg-transparent file:px-3 file:py-1.5 file:text-sm file:text-foreground";
