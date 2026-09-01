"use client";

import { useState } from "react";
import { Calendar, FileText, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ItemStatusSelect } from "@/components/operacao/item-status-select";
import { ClientHubItemDialog, type ClientHubItemVariant } from "@/components/clientes/hub/client-hub-item-dialog";
import type { ProductionItemWithAssignee } from "@/lib/operacao/queries";
import type { User } from "@/lib/supabase/types/database";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });
function formatDate(value: string | null): string {
  if (!value) return "—";
  return dateFormatter.format(new Date(`${value}T00:00:00`));
}

const VARIANT_ICON = { calendar: Calendar, roteiro: FileText, story: Sparkles };
const VARIANT_CREATE_LABEL = { calendar: "Novo conteúdo", roteiro: "Novo roteiro", story: "Novo story" };
const VARIANT_EMPTY_TITLE = {
  calendar: "Nenhum conteúdo planejado ainda.",
  roteiro: "Nenhum roteiro cadastrado ainda.",
  story: "Nenhum story planejado ainda.",
};
const VARIANT_SECOND_COLUMN = { calendar: "Conteúdo", roteiro: "Roteiro", story: "Tema" };
const VARIANT_THIRD_COLUMN = { calendar: "Canal", roteiro: "Tipo", story: "Sequência" };

/**
 * Lista das 3 seções de conteúdo do Client Hub (Cronograma/Roteiros/Stories) — mesmo componente
 * parametrizado por `variant` (mesma tabela por trás, `production_items`/`kind='conteudo'`, só o
 * `format` muda). Tabela em telas ≥ md, cards empilhados abaixo disso — não existe um padrão
 * "tabela vira card" pronto no design system ainda, este é construído aqui e pode virar
 * referência pra outras telas que quiserem o mesmo tratamento no futuro.
 */
export function ClientHubItemList({
  variant,
  clientId,
  items,
  users,
}: {
  variant: ClientHubItemVariant;
  clientId: string;
  items: ProductionItemWithAssignee[];
  users: User[];
}) {
  const [creating, setCreating] = useState(false);
  const [editingItem, setEditingItem] = useState<ProductionItemWithAssignee | null>(null);
  const Icon = VARIANT_ICON[variant];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{VARIANT_SECOND_COLUMN[variant]}</h2>
        <Button type="button" size="sm" onClick={() => setCreating(true)} className="gap-1.5">
          <Plus className="size-3.5" />
          {VARIANT_CREATE_LABEL[variant]}
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={Icon} title={VARIANT_EMPTY_TITLE[variant]} description="Crie o primeiro com o botão acima." fullBleed={false} />
      ) : (
        <>
          {/* Desktop/tablet — tabela completa */}
          <div className="hidden overflow-hidden rounded-xl border border-border/60 md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead>Data</TableHead>
                  <TableHead>{VARIANT_SECOND_COLUMN[variant]}</TableHead>
                  <TableHead>{VARIANT_THIRD_COLUMN[variant]}</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} className="border-border/60">
                    <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(item.scheduled_date)}</TableCell>
                    <TableCell className="max-w-[280px] font-medium">
                      <span className="line-clamp-2">{item.title}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{variant === "story" ? (item.story_sequence ?? "—") : (item.channel ?? "—")}</TableCell>
                    <TableCell>
                      <ItemStatusSelect itemId={item.id} kind="conteudo" statusLabel={item.status_label} clientId={clientId} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.assigneeName ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <button type="button" onClick={() => setEditingItem(item)} className="text-xs text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline">
                        Visualizar
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile — cards empilhados, mesma informação sem rolagem horizontal. `<select>` (status)
           *  fica como controle irmão, nunca aninhado dentro do "Visualizar" — um `<select>`
           *  dentro de um `<button>` é HTML inválido e o clique nele podia disparar o card
           *  inteiro por baixo em alguns navegadores. */}
          <div className="flex flex-col gap-3 md:hidden">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col gap-2.5 rounded-xl border border-border/60 bg-card/40 p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-medium">{item.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatDate(item.scheduled_date)}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {variant !== "story" && item.channel && <span>{item.channel}</span>}
                  {variant === "story" && item.story_sequence != null && <span>Sequência {item.story_sequence}</span>}
                  {item.assigneeName && <span>{item.assigneeName}</span>}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <ItemStatusSelect itemId={item.id} kind="conteudo" statusLabel={item.status_label} clientId={clientId} />
                  <button type="button" onClick={() => setEditingItem(item)} className="text-xs text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline">
                    Visualizar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <ClientHubItemDialog open={creating} onOpenChange={setCreating} clientId={clientId} variant={variant} users={users} />
      {editingItem && (
        <ClientHubItemDialog
          key={editingItem.id}
          open
          onOpenChange={(open) => !open && setEditingItem(null)}
          clientId={clientId}
          variant={variant}
          item={editingItem}
          users={users}
        />
      )}
    </div>
  );
}
