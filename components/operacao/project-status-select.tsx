"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProductionProjectStatusAction } from "@/lib/operacao/actions";
import { PRODUCTION_PROJECT_STATUSES, PRODUCTION_PROJECT_STATUS_LABEL } from "@/lib/operacao/types";
import type { ProductionProjectStatus } from "@/lib/supabase/types/database";

/** Mesmo padrão de `components/clientes/client-status-select.tsx`. */
export function ProjectStatusSelect({ projectId, status }: { projectId: string; status: ProductionProjectStatus }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value as ProductionProjectStatus;
        startTransition(async () => {
          await updateProductionProjectStatusAction(projectId, next);
          router.refresh();
        });
      }}
      className="h-8 rounded-md border border-input bg-transparent px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      {PRODUCTION_PROJECT_STATUSES.map((option) => (
        <option key={option} value={option}>
          {PRODUCTION_PROJECT_STATUS_LABEL[option]}
        </option>
      ))}
    </select>
  );
}
