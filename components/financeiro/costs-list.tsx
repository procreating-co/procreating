"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CostFormDialog } from "@/components/financeiro/cost-form-dialog";
import { EmptyState } from "@/components/dashboard/empty-state";
import { deleteCostAction } from "@/lib/financeiro/actions";
import type { Cost } from "@/lib/supabase/types/database";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const RECURRENCE_LABEL: Record<Cost["recurrence"], string> = { fixo: "Fixo", variavel: "Variável" };

export function CostsList({ costs }: { costs: Cost[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (costs.length === 0) {
    return (
      <>
        <EmptyState
          icon={Wallet}
          title="Nenhum custo cadastrado ainda"
          description="Aluguel, ferramentas, pró-labore — a estrutura de custo fixo e variável da empresa, pra saber quanto custa operar antes de qualquer distribuição."
          action={
            <Button type="button" onClick={() => setCreating(true)} className="gap-2">
              <Plus className="size-4" />
              Novo custo
            </Button>
          }
        />
        <CostFormDialog open={creating} onOpenChange={setCreating} />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Button type="button" onClick={() => setCreating(true)} className="ml-auto gap-2 self-start">
        <Plus className="size-4" />
        Novo custo
      </Button>

      <div className="overflow-hidden rounded-xl border border-border/60">
        <Table>
          <TableHeader>
            <TableRow className="border-border/60 hover:bg-transparent">
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Recorrência</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {costs.map((cost) => (
              <TableRow key={cost.id} className="border-border/60">
                <TableCell className="font-medium">{cost.name}</TableCell>
                <TableCell className="text-muted-foreground">{cost.category}</TableCell>
                <TableCell className="text-muted-foreground">{RECURRENCE_LABEL[cost.recurrence]}</TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">{currencyFormatter.format(Number(cost.amount))}</TableCell>
                <TableCell>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => startTransition(async () => {
                      await deleteCostAction(cost.id);
                      router.refresh();
                    })}
                    className="text-muted-foreground transition-colors hover:text-danger"
                    aria-label={`Excluir ${cost.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CostFormDialog open={creating} onOpenChange={setCreating} />
    </div>
  );
}
