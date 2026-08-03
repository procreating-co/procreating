import { ArrowRight } from "lucide-react";
import type { LauncherClient } from "@/lib/clients/launcher-mock-data";

/**
 * Conteúdo de uma linha — o hover/seleção em si (fundo, cursor) é responsabilidade do
 * `CommandItem` pai (`components/ui/command.tsx`), que já marca `group` + `data-selected`.
 * Status só aparece no hover/seleção via teclado, nunca por padrão — "no descriptions unless
 * hovered", pedido explícito.
 */
export function ClientRow({ client }: { client: LauncherClient }) {
  return (
    <div className="flex w-full items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="text-[15px] text-foreground">{client.name}</span>
        <span className="rounded-full border border-border/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-data-[selected=true]:opacity-100">
          {client.status}
        </span>
      </div>
      <ArrowRight className="size-4 -translate-x-1 text-muted-foreground opacity-0 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100 group-data-[selected=true]:translate-x-0 group-data-[selected=true]:opacity-100" />
    </div>
  );
}
