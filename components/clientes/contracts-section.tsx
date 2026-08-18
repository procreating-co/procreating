"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/dashboard/status-dot";
import { ContractFormDialog } from "@/components/clientes/contract-form-dialog";
import { CONTRACT_CATEGORY_LABEL, CONTRACT_CATEGORY_TONE } from "@/lib/financeiro/contract-category";
import type { Contract, ContractScopeItem } from "@/lib/supabase/types/database";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

type ContractWithScope = Contract & { scopeItems: ContractScopeItem[] };

/** "Não é possível editar clientes... quero poder adicionar e mudar infos de valor, tempo de
 *  contrato" (pedido explícito) — antes só existia criação de contrato via fechamento de negócio
 *  (`close_lead_and_create_client`); um cliente já existente (renovação, upsell, reajuste) não
 *  tinha UI nenhuma, só SQL direto. `+ Novo contrato` cobre o primeiro caso, `Editar` por linha
 *  cobre o segundo — mesmo `ContractFormDialog`, dois modos. */
export function ContractsSection({ clientId, contracts }: { clientId: string; contracts: ContractWithScope[] }) {
  const [creating, setCreating] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Contrato{contracts.length > 1 ? "s" : ""}</h2>
        <Button type="button" variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={() => setCreating(true)}>
          <Plus className="size-3" />
          Novo contrato
        </Button>
      </div>

      {contracts.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum contrato registrado.</p>
      ) : (
        contracts.map((contract) => (
          <div key={contract.id} className="group flex flex-col gap-2 border-t border-border/60 pt-3 text-sm first:border-t-0 first:pt-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium capitalize">{contract.type}</span>
              <StatusDot tone={CONTRACT_CATEGORY_TONE[contract.category]} label={CONTRACT_CATEGORY_LABEL[contract.category]} />
              <span className="text-muted-foreground">
                {dateFormatter.format(new Date(contract.start_date))}
                {contract.end_date ? ` até ${dateFormatter.format(new Date(contract.end_date))}` : ""}
              </span>
              <button
                type="button"
                onClick={() => setEditingContract(contract)}
                className="ml-auto flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
              >
                <Pencil className="size-3" />
                Editar
              </button>
            </div>
            <p className="text-muted-foreground">
              {contract.type === "recorrente"
                ? `${currencyFormatter.format(Number(contract.monthly_value ?? 0))}/mês · vencimento dia ${contract.due_day ?? "—"}`
                : currencyFormatter.format(Number(contract.total_value ?? 0))}
            </p>
            {contract.scopeItems.length > 0 && (
              <ul className="flex flex-col gap-1 text-muted-foreground">
                {contract.scopeItems.map((item) => (
                  <li key={item.id}>
                    · {item.service}
                    {item.quantity ? ` (${item.quantity}${item.frequency ? `, ${item.frequency}` : ""})` : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))
      )}

      <ContractFormDialog clientId={clientId} open={creating} onOpenChange={setCreating} />
      {/* `key` pelo id do contrato — sem isto, trocar de "editar contrato A" pra "editar
       *  contrato B" sem fechar o dialog no meio reaproveitaria a instância montada e o form
       *  ficaria com o `useState` inicial de A (só é lido uma vez, no mount). */}
      {editingContract && (
        <ContractFormDialog
          key={editingContract.id}
          clientId={clientId}
          contract={editingContract}
          open
          onOpenChange={(open) => !open && setEditingContract(null)}
        />
      )}
    </section>
  );
}
