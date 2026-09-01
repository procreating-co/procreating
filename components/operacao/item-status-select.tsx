"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProductionItemStatusAction } from "@/lib/operacao/actions";
import { PRODUCTION_ITEM_STATUS_PRESETS } from "@/lib/operacao/types";
import type { ProductionItemKind } from "@/lib/supabase/types/database";

/** Mesmo padrão de `project-status-select.tsx` — só que sobre uma lista de presets (`label`+
 *  `tone` juntos, não um enum de banco) em vez de um `check` constraint, já que `production_items`
 *  guarda `status_label` como texto livre (motivo documentado na migration). */
export function ItemStatusSelect({
  itemId,
  kind,
  statusLabel,
  clientId,
}: {
  itemId: string;
  kind: ProductionItemKind;
  statusLabel: string;
  /** Opcional — Client Hub (`/clientes/[id]/hub`) passa o id do cliente pra também revalidar essa
   *  rota; as 3 páginas de Operação (Produção/Entregas/Recursos) não passam nada, comportamento
   *  idêntico ao de sempre. */
  clientId?: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const presets = PRODUCTION_ITEM_STATUS_PRESETS[kind];

  return (
    <select
      value={statusLabel}
      disabled={isPending}
      onChange={(e) => {
        const preset = presets.find((p) => p.label === e.target.value);
        if (!preset) return;
        startTransition(async () => {
          await updateProductionItemStatusAction(itemId, kind, preset.label, preset.tone, clientId);
          router.refresh();
        });
      }}
      className="h-8 rounded-md border border-input bg-transparent px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      {presets.map((preset) => (
        <option key={preset.label} value={preset.label}>
          {preset.label}
        </option>
      ))}
    </select>
  );
}
