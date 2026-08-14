"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListImportDrawer } from "@/components/comercial/list-import-drawer";
import type { ProspectingList } from "@/lib/supabase/types/database";
import type { Strategy } from "@/lib/supabase/types/database";

const LIST_STATUS_LABEL: Record<ProspectingList["status"], string> = {
  em_prospeccao: "Em prospecção",
  pausada: "Pausada",
  concluida: "Concluída",
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });

/**
 * Prospecção — o motor de listas mora aqui. Cada lista é um card (nome, origem, contagem,
 * estratégia, status) que leva pro CRM já filtrado por ela (`?tab=crm&list=id`) — não existe uma
 * página própria de "detalhe da lista", o CRM (Pipeline/Lista) já É essa visão, só filtrada
 * (princípio "AGLUTINE", seção 2 do prompt).
 */
export function ProspeccaoView({ lists, strategies }: { lists: ProspectingList[]; strategies: Strategy[] }) {
  const [importing, setImporting] = useState(false);
  const strategyById = new Map(strategies.map((strategy) => [strategy.id, strategy]));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Listas importadas — clique numa lista pra ver os leads dela no CRM.</p>
        <Button type="button" onClick={() => setImporting(true)} className="gap-2">
          <Plus className="size-4" />
          Importar lista
        </Button>
      </div>

      {lists.length === 0 ? (
        <div
          onClick={() => setImporting(true)}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 px-6 py-16 text-center text-muted-foreground hover:border-border"
        >
          <p className="text-sm">Nenhuma lista importada ainda.</p>
          <p className="text-xs">Solte um CSV pra começar a prospecção ativa.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => {
            const strategy = list.strategy_id ? strategyById.get(list.strategy_id) : undefined;
            return (
              <Link
                key={list.id}
                href={`/comercial?tab=crm&list=${list.id}`}
                className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/20 p-4 transition-colors hover:border-border hover:bg-card/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{list.name}</p>
                  <span className="shrink-0 rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">{LIST_STATUS_LABEL[list.status]}</span>
                </div>
                <p className="text-2xl font-semibold tabular-nums">{list.lead_count}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{strategy ? strategy.name : "Sem estratégia"}</span>
                  <span>{dateFormatter.format(new Date(list.created_at))}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <ListImportDrawer open={importing} onOpenChange={setImporting} strategies={strategies} />
    </div>
  );
}
