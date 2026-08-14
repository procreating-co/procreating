"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LeadFormDialog } from "@/components/comercial/lead-form-dialog";
import { LeadDetailDrawer } from "@/components/comercial/lead-detail-drawer";
import { stageColorClasses } from "@/lib/comercial/stage-colors";
import type { LeadWithRelations, PipelineStage } from "@/lib/comercial/types";
import type { Strategy, User } from "@/lib/supabase/types/database";
import { cn } from "@/lib/utils";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function LeadsTable({
  leads,
  stages,
  strategies,
  users,
}: {
  leads: LeadWithRelations[];
  stages: PipelineStage[];
  strategies: Strategy[];
  users: User[];
}) {
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string | "todos">("todos");
  const [creating, setCreating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesQuery = !normalized || lead.company_name.toLowerCase().includes(normalized) || (lead.contact_name ?? "").toLowerCase().includes(normalized);
      const matchesStage = stageFilter === "todos" || lead.stage_id === stageFilter;
      return matchesQuery && matchesStage;
    });
  }, [leads, query, stageFilter]);

  const selected = leads.find((lead) => lead.id === selectedId) ?? null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar lead..." className="pl-9" />
        </div>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          aria-label="Filtrar por estágio"
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <option value="todos">Todos os estágios</option>
          {stages.map((stage) => (
            <option key={stage.id} value={stage.id}>
              {stage.label}
            </option>
          ))}
        </select>
        <Button type="button" onClick={() => setCreating(true)} className="ml-auto gap-2">
          <Plus className="size-4" />
          Novo lead
        </Button>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-card/20 px-6 py-16 text-center text-muted-foreground">
          {leads.length === 0 ? "Nenhum lead cadastrado ainda." : "Nenhum lead encontrado."}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead>Empresa</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Estágio</TableHead>
                <TableHead>Valor potencial</TableHead>
                <TableHead>Estratégia</TableHead>
                <TableHead>Responsável</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((lead) => {
                const stage = stageColorClasses(lead.stage.color);
                const owner = users.find((user) => user.id === lead.owner_id);
                return (
                  <TableRow key={lead.id} className="cursor-pointer border-border/60" onClick={() => setSelectedId(lead.id)}>
                    <TableCell className="font-medium">{lead.company_name}</TableCell>
                    <TableCell className="text-muted-foreground">{lead.contact_name || "—"}</TableCell>
                    <TableCell>
                      <span className={cn("rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide", stage.badge)}>{lead.stage.label}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{lead.potential_value != null ? currencyFormatter.format(lead.potential_value) : "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{lead.strategy?.name ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{owner?.name ?? "—"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <LeadFormDialog open={creating} onOpenChange={setCreating} strategies={strategies} />
      <LeadDetailDrawer lead={selected} users={users} onOpenChange={(open) => !open && setSelectedId(null)} />
    </div>
  );
}
