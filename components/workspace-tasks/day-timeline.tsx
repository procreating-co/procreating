"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2 } from "lucide-react";
import { completeTimeBlockAction, deleteTimeBlockAction, type TimeBlockWithTask } from "@/lib/tasks/time-block-actions";
import { cn } from "@/lib/utils";

const timeFormatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });

/**
 * Calendário — versão dia (§18): o que já existia era zero (auditado, não existe calendário
 * neste projeto) — esta é a fundação real, focada no que o pedido efetivamente exemplifica
 * ("27/08 14:00–14:30"), não um calendário mensal completo (escopo muito maior, sem pedido
 * explícito por essa forma).
 */
export function DayTimeline({ blocks, clientNameById }: { blocks: TimeBlockWithTask[]; clientNameById: Map<string, string> }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (blocks.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum bloco planejado pra hoje ainda.</p>;
  }

  function complete(blockId: string) {
    startTransition(async () => {
      await completeTimeBlockAction(blockId);
      router.refresh();
    });
  }

  function remove(blockId: string) {
    startTransition(async () => {
      await deleteTimeBlockAction(blockId);
      router.refresh();
    });
  }

  return (
    <ul className="flex flex-col divide-y divide-border/60 rounded-xl border border-border/60 bg-card/40">
      {blocks.map((block) => (
        <li key={block.id} className="group flex items-center gap-3 px-4 py-3">
          <span className="w-28 shrink-0 font-mono text-xs text-muted-foreground">
            {timeFormatter.format(new Date(block.start_at))} – {timeFormatter.format(new Date(block.end_at))}
          </span>
          <span className={cn("flex-1 text-sm", block.status === "done" && "text-muted-foreground line-through")}>
            {block.taskTitle}
            {block.taskClientId && clientNameById.get(block.taskClientId) && <span className="text-muted-foreground"> · {clientNameById.get(block.taskClientId)}</span>}
          </span>
          <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {block.status !== "done" && (
              <button type="button" disabled={isPending} onClick={() => complete(block.id)} aria-label="Concluir bloco" className="rounded p-1 text-muted-foreground hover:text-foreground">
                <Check className="size-3.5" />
              </button>
            )}
            <button type="button" disabled={isPending} onClick={() => remove(block.id)} aria-label="Remover bloco" className="rounded p-1 text-muted-foreground hover:text-destructive">
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
