"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Tag as TagIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { bulkAddTagAction, bulkAssignOwnerAction, bulkAssignStrategyAction, bulkMoveStageAction } from "@/lib/comercial/actions";
import type { LeadWithRelations, PipelineStage } from "@/lib/comercial/types";
import type { Strategy, User } from "@/lib/supabase/types/database";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/**
 * Master prompt §71 — "toolbar contextual que aparece somente quando houver seleção", não um
 * modal por ação. Cada `<select>`/input dispara na hora (`onChange`/Enter), sem botão
 * "Aplicar" — o valor escolhido JÁ É a ação, mesmo espírito de "manipulação direta" do resto do
 * produto (§56-58). `onDone` limpa a seleção e revalida a lista.
 */
export function BulkActionsToolbar({
  selectedLeads,
  stages,
  strategies,
  users,
  onDone,
}: {
  selectedLeads: LeadWithRelations[];
  stages: PipelineStage[];
  strategies: Strategy[];
  users: User[];
  onDone: () => void;
}) {
  const router = useRouter();
  const [tag, setTag] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const ids = selectedLeads.map((lead) => lead.id);
  // Nunca oferece "Fechado" como destino em massa — mesma regra do drag-and-drop do Kanban.
  const movableStages = stages.filter((stage) => !stage.is_won);
  const totalValue = selectedLeads.reduce((sum, lead) => sum + Number(lead.potential_value ?? 0), 0);

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "Não foi possível aplicar.");
        return;
      }
      setTag("");
      onDone();
      router.refresh();
    });
  }

  function exportCsv() {
    const header = ["Empresa", "Contato", "Estágio", "Valor potencial", "Estratégia", "Responsável"];
    const rows = selectedLeads.map((lead) => [
      lead.company_name,
      lead.contact_name ?? "",
      lead.stage.label,
      lead.potential_value != null ? String(lead.potential_value) : "",
      lead.strategy?.name ?? "",
      users.find((user) => user.id === lead.owner_id)?.name ?? "",
    ]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-brand-subtle-border bg-brand-subtle/40 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-brand">
          {selectedLeads.length} lead{selectedLeads.length === 1 ? "" : "s"} selecionado{selectedLeads.length === 1 ? "" : "s"}
        </span>
        {totalValue > 0 && <span className="text-xs text-muted-foreground">{currencyFormatter.format(totalValue)} em potencial</span>}

        <select
          disabled={isPending}
          defaultValue=""
          onChange={(e) => e.target.value && run(() => bulkAssignOwnerAction(ids, e.target.value))}
          aria-label="Atribuir responsável"
          className="h-8 rounded-md border border-input bg-input-background px-2 text-xs outline-none focus-visible:border-ring"
        >
          <option value="" disabled>
            Atribuir a...
          </option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>

        <select
          disabled={isPending}
          defaultValue=""
          onChange={(e) => e.target.value && run(() => bulkAssignStrategyAction(ids, e.target.value))}
          aria-label="Atribuir estratégia"
          className="h-8 rounded-md border border-input bg-input-background px-2 text-xs outline-none focus-visible:border-ring"
        >
          <option value="" disabled>
            Estratégia...
          </option>
          {strategies.map((strategy) => (
            <option key={strategy.id} value={strategy.id}>
              {strategy.name}
            </option>
          ))}
        </select>

        <select
          disabled={isPending}
          defaultValue=""
          onChange={(e) => e.target.value && run(() => bulkMoveStageAction(ids, e.target.value))}
          aria-label="Mover para estágio"
          className="h-8 rounded-md border border-input bg-input-background px-2 text-xs outline-none focus-visible:border-ring"
        >
          <option value="" disabled>
            Mover para...
          </option>
          {movableStages.map((stage) => (
            <option key={stage.id} value={stage.id}>
              {stage.label}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1">
          <TagIcon className="size-3.5 text-muted-foreground" />
          <Input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && tag.trim()) run(() => bulkAddTagAction(ids, tag));
            }}
            placeholder="Tag + Enter"
            disabled={isPending}
            className="h-8 w-28 text-xs"
          />
        </div>

        <Button type="button" size="sm" variant="outline" className="h-8 text-xs" onClick={exportCsv}>
          Exportar CSV
        </Button>

        <button type="button" onClick={onDone} aria-label="Limpar seleção" className="ml-auto flex size-7 items-center justify-center rounded text-muted-foreground hover:text-foreground">
          <X className="size-4" />
        </button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
