"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateReceivablesAlertDaysAction } from "@/lib/financeiro/actions";

/** Automação §72 regra 3 — "conta a receber vencendo em N dias". Único campo editável desta
 *  página por ora (o resto continua só leitura, ver comentário no `page.tsx`) — escopo
 *  deliberadamente pequeno, não uma tela de settings genérica. */
export function ReceivablesAlertDaysField({ initialDays }: { initialDays: number }) {
  const router = useRouter();
  const [days, setDays] = useState(initialDays);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateReceivablesAlertDaysAction(days);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={1}
          value={days}
          onChange={(e) => {
            setDays(Number(e.target.value) || 1);
            setSaved(false);
          }}
          className="w-20"
        />
        <span className="text-sm text-muted-foreground">dias de antecedência</span>
        <Button type="button" size="sm" variant="outline" onClick={handleSave} disabled={isPending || days === initialDays}>
          {isPending ? "Salvando..." : "Salvar"}
        </Button>
      </div>
      {saved && <p className="text-xs text-success">Salvo — vale pro Financeiro e pro Dashboard a partir de agora.</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
