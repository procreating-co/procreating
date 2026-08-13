"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateClientStatusAction } from "@/lib/clientes/actions";
import type { ClientStatus } from "@/lib/supabase/types/database";

const OPTIONS: { value: ClientStatus; label: string }[] = [
  { value: "lead", label: "Lead" },
  { value: "onboarding", label: "Onboarding" },
  { value: "ativo", label: "Ativo" },
  { value: "atencao", label: "Atenção" },
  { value: "risco", label: "Risco" },
  { value: "churn", label: "Churn" },
];

export function ClientStatusSelect({ clientId, status }: { clientId: string; status: ClientStatus }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value as ClientStatus;
        startTransition(async () => {
          await updateClientStatusAction(clientId, next);
          router.refresh();
        });
      }}
      className="h-8 rounded-md border border-input bg-transparent px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      {OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
