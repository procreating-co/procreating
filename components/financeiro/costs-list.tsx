"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CostFormDialog } from "@/components/financeiro/cost-form-dialog";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteCostAction } from "@/lib/financeiro/actions";
import type { Cost } from "@/lib/supabase/types/database";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const RECURRENCE_LABEL: Record<Cost["recurrence"], string> = { fixo: "Fixo", variavel: "Variável" };

export function CostsList({ costs }: { costs: Cost[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editingCost, setEditingCost] = useState<Cost | null>(null);
  const [deletingCost, setDeletingCost] = useState<Cost | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Auditoria de estados de erro (hardening) — fechava o ConfirmDialog mesmo se a exclusão
  // falhasse, dando a impressão de sucesso sem ter acontecido.
  function handleDelete() {
    if (!deletingCost) return;
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteCostAction(deletingCost.id);
      if (!result.ok) {
        setDeleteError(result.error);
        return;
      }
      setDeletingCost(null);
      router.refresh();
    });
  }

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
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingCost(cost)}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={`Editar ${cost.name}`}
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => setDeletingCost(cost)}
                      className="text-muted-foreground transition-colors hover:text-danger"
                      aria-label={`Excluir ${cost.name}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CostFormDialog open={creating} onOpenChange={setCreating} />
      {editingCost && (
        <CostFormDialog key={editingCost.id} cost={editingCost} open onOpenChange={(open) => !open && setEditingCost(null)} />
      )}
      <ConfirmDialog
        open={deletingCost !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteError(null);
            setDeletingCost(null);
          }
        }}
        title="Excluir custo?"
        description={deleteError ?? (deletingCost ? `"${deletingCost.name}" some pra sempre — não dá pra desfazer.` : undefined)}
        isPending={isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
