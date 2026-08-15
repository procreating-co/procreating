"use client";

import { useState } from "react";
import { Clapperboard, PackageCheck, Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ItemFormDialog } from "@/components/operacao/item-form-dialog";
import { ItemStatusSelect } from "@/components/operacao/item-status-select";
import type { ProductionItemWithRelations } from "@/lib/operacao/queries";
import type { Client, ProductionItemKind } from "@/lib/supabase/types/database";

const CREATE_LABEL: Record<ProductionItemKind, string> = { producao: "Novo conteúdo", entrega: "Nova entrega", conteudo: "Novo conteúdo" };
const EMPTY_LABEL: Record<ProductionItemKind, string> = {
  producao: "Nenhum conteúdo em produção ainda.",
  entrega: "Nenhuma entrega em andamento ainda.",
  conteudo: "Nenhum conteúdo planejado ainda.",
};
// Ícone resolvido AQUI (componente client), não recebido como prop do Server Component — função/
// componente não é serializável através da fronteira RSC (Next.js recusa em runtime).
const EMPTY_ICON: Record<ProductionItemKind, typeof Clapperboard> = { producao: Clapperboard, entrega: PackageCheck, conteudo: Send };

/**
 * Tabela real (troca `DEMO_PRODUCTIONS`/`DEMO_DELIVERIES`/`DEMO_CONTENT`, hoje removidos) —
 * compartilhada pelas 3 páginas (Produção/Entregas/Recursos), que só diferem no `kind` que
 * passam. Status editável inline (`ItemStatusSelect`), sem página de detalhe — o volume dessas 3
 * áreas não justifica um drawer/detail própria ainda.
 */
export function ProductionItemsTable({ kind, items, clients }: { kind: ProductionItemKind; items: ProductionItemWithRelations[]; clients: Client[] }) {
  const [creating, setCreating] = useState(false);
  const Icon = EMPTY_ICON[kind];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{kind === "entrega" ? "Entregas" : "Conteúdos"}</h2>
        <Button type="button" size="sm" onClick={() => setCreating(true)} className="gap-1.5">
          <Plus className="size-3.5" />
          {CREATE_LABEL[kind]}
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={Icon} title={EMPTY_LABEL[kind]} description="Crie o primeiro com o botão acima." fullBleed={false} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead>Título</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} className="border-border/60">
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell className="text-muted-foreground">{item.clientName ?? "—"}</TableCell>
                  <TableCell>
                    <ItemStatusSelect itemId={item.id} kind={kind} statusLabel={item.status_label} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ItemFormDialog open={creating} onOpenChange={setCreating} kind={kind} clients={clients} />
    </div>
  );
}
