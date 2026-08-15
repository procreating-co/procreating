"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createContractAction, updateContractAction, type ContractFormInput } from "@/lib/clientes/contract-actions";
import type { Contract, ContractStatus, ContractType } from "@/lib/supabase/types/database";

const TYPE_OPTIONS: { value: ContractType; label: string }[] = [
  { value: "recorrente", label: "Recorrente (mensal)" },
  { value: "pontual", label: "Pontual (projeto único)" },
];

const STATUS_OPTIONS: { value: ContractStatus; label: string }[] = [
  { value: "ativo", label: "Ativo" },
  { value: "encerrado", label: "Encerrado" },
  { value: "cancelado", label: "Cancelado" },
];

function toFormInput(contract?: Contract): ContractFormInput {
  return {
    type: contract?.type ?? "recorrente",
    status: contract?.status ?? "ativo",
    startDate: contract?.start_date ?? "",
    endDate: contract?.end_date ?? null,
    monthlyValue: contract?.monthly_value ?? null,
    totalValue: contract?.total_value ?? null,
    dueDay: contract?.due_day ?? 5,
    paymentTerms: contract?.payment_terms ?? null,
    specialConditions: contract?.special_conditions ?? null,
  };
}

/**
 * Único dialog pra criar E editar contrato — mesmo formulário, `contract` presente = edição
 * (`updateContractAction`), ausente = novo contrato pro cliente (`createContractAction`).
 * Categoria (`recorrente_ativo` etc.) nunca aparece aqui — é derivada de type+status na action,
 * nunca escolhida à mão (ver comentário em `lib/clientes/contract-actions.ts`).
 */
export function ContractFormDialog({
  clientId,
  contract,
  open,
  onOpenChange,
}: {
  clientId: string;
  contract?: Contract;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ContractFormInput>(() => toFormInput(contract));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function reset() {
    setForm(toFormInput(contract));
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = contract ? await updateContractAction(contract.id, clientId, form) : await createContractAction(clientId, form);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-lg gap-5">
        <DialogHeader>
          <DialogTitle>{contract ? "Editar contrato" : "Novo contrato"}</DialogTitle>
          <DialogDescription>Valor, período e condições — mesmos campos usados no fechamento do negócio.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="contract-type">Tipo</Label>
              <select
                id="contract-type"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ContractType }))}
                className="h-9 rounded-md border border-input bg-input-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="contract-status">Status</Label>
              <select
                id="contract-status"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ContractStatus }))}
                className="h-9 rounded-md border border-input bg-input-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="contract-start">Início</Label>
              <Input id="contract-start" type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="contract-end">Fim (opcional)</Label>
              <Input
                id="contract-end"
                type="date"
                value={form.endDate ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value || null }))}
              />
            </div>
          </div>

          {form.type === "recorrente" ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="contract-monthly">Valor mensal (R$)</Label>
                <Input
                  id="contract-monthly"
                  type="number"
                  min={0}
                  inputMode="decimal"
                  value={form.monthlyValue ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, monthlyValue: e.target.value === "" ? null : Number(e.target.value) }))}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="contract-due-day">Dia de vencimento</Label>
                <Input
                  id="contract-due-day"
                  type="number"
                  min={1}
                  max={31}
                  value={form.dueDay ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, dueDay: e.target.value === "" ? null : Number(e.target.value) }))}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Label htmlFor="contract-total">Valor total (R$)</Label>
              <Input
                id="contract-total"
                type="number"
                min={0}
                inputMode="decimal"
                value={form.totalValue ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, totalValue: e.target.value === "" ? null : Number(e.target.value) }))}
                required
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="contract-payment-terms">Forma de pagamento (opcional)</Label>
            <Input
              id="contract-payment-terms"
              value={form.paymentTerms ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, paymentTerms: e.target.value || null }))}
              placeholder="Ex.: PIX, vencimento no 5º dia útil"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="contract-special-conditions">Condições especiais (opcional)</Label>
            <textarea
              id="contract-special-conditions"
              value={form.specialConditions ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, specialConditions: e.target.value || null }))}
              rows={2}
              className="w-full resize-none rounded-md border border-input bg-input-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : contract ? "Salvar alterações" : "Criar contrato"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
