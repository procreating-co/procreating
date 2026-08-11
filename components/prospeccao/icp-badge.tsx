import { ICP_BADGE_CLASSES, ICP_LABEL } from "@/lib/prospeccao/icp";
import type { AderenciaIcp } from "@/lib/prospeccao/types";
import { cn } from "@/lib/utils";

/** Pill de Aderência ICP — mesmo componente na tabela de Oficinas e no card do Kanban. */
export function IcpBadge({ value, className }: { value: AderenciaIcp; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-xs whitespace-nowrap",
        ICP_BADGE_CLASSES[value],
        className,
      )}
    >
      {ICP_LABEL[value]}
    </span>
  );
}
