import { STAGE_BADGE_CLASSES, STAGE_LABEL } from "@/lib/prospeccao/stages";
import type { OficinaStage } from "@/lib/prospeccao/types";
import { cn } from "@/lib/utils";

/** Pill de status — mesmo componente em Oficinas, Kanban e drawer de detalhe (uma única fonte visual). */
export function StageBadge({ status, className }: { status: OficinaStage; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-xs whitespace-nowrap",
        STAGE_BADGE_CLASSES[status],
        className,
      )}
    >
      {STAGE_LABEL[status]}
    </span>
  );
}
