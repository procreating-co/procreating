"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setCurrentMonthGoalAction } from "@/lib/dashboard/actions";

export function RevenueGoalForm({ currentAmount }: { currentAmount: number | null }) {
  const router = useRouter();
  const [value, setValue] = useState(currentAmount != null ? String(currentAmount) : "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await setCurrentMonthGoalAction(Number(value));
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex flex-1 flex-col gap-2">
        <Label htmlFor="revenue-goal">Meta de faturamento — este mês (R$)</Label>
        <Input id="revenue-goal" type="number" inputMode="decimal" min="0" step="1" value={value} onChange={(e) => setValue(e.target.value)} required />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Salvando..." : currentAmount != null ? "Atualizar meta" : "Definir meta"}
      </Button>
      {error && <p className="text-sm text-destructive sm:ml-3">{error}</p>}
    </form>
  );
}
