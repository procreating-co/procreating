"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createQuoteAction, getServiceCatalogAction, type QuoteItemInput } from "@/lib/comercial/quote-actions";
import type { ServiceCatalogItem } from "@/lib/supabase/types/database";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

type DraftItem = QuoteItemInput & { key: string };

function emptyItem(): DraftItem {
  return { key: crypto.randomUUID(), serviceName: "", description: "", quantity: 1, unitPrice: 0 };
}

/**
 * Orçamento por item — nasce do "+ Orçamento" no drawer do lead. Serviço vem do catálogo (select
 * com preço pré-preenchido, editável) ou é digitado livre (entra no catálogo pra próxima vez —
 * ver `createQuoteAction`). Total soma ao vivo; nunca escreve nada até "Salvar orçamento".
 */
export function QuoteBuilderDialog({ leadId, open, onOpenChange }: { leadId: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [catalog, setCatalog] = useState<ServiceCatalogItem[]>([]);
  const [title, setTitle] = useState("Proposta comercial");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<DraftItem[]>([emptyItem()]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setTitle("Proposta comercial");
    setNotes("");
    setItems([emptyItem()]);
    setError(null);
    getServiceCatalogAction().then(setCatalog);
  }, [open]);

  const total = useMemo(() => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0), [items]);

  function updateItem(key: string, patch: Partial<DraftItem>) {
    setItems((current) => current.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  function pickFromCatalog(key: string, catalogId: string) {
    const service = catalog.find((s) => s.id === catalogId);
    if (!service) return;
    updateItem(key, { serviceName: service.name, description: service.description ?? "", unitPrice: Number(service.default_price ?? 0) });
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await createQuoteAction({
        leadId,
        title,
        notes,
        items: items.filter((item) => item.serviceName.trim()).map(({ key: _key, ...rest }) => rest),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-5">
        <DialogHeader>
          <DialogTitle>Novo orçamento</DialogTitle>
          <DialogDescription>Monte a proposta por item — serviço, quantidade e valor. Vira um orçamento em rascunho, editável depois.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="quote-title">Título</Label>
            <Input id="quote-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Itens</Label>
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <div key={item.key} className="grid grid-cols-[1fr_auto_auto_auto] items-end gap-2 rounded-lg border border-border/60 p-2">
                  <div className="flex flex-col gap-1">
                    <select
                      value=""
                      onChange={(e) => e.target.value && pickFromCatalog(item.key, e.target.value)}
                      className="h-7 rounded-md border border-input bg-transparent px-1.5 text-xs outline-none focus-visible:border-ring"
                    >
                      <option value="">Do catálogo...</option>
                      {catalog.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                    <Input
                      placeholder="Nome do serviço"
                      value={item.serviceName}
                      onChange={(e) => updateItem(item.key, { serviceName: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="flex w-20 flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground">Qtd.</span>
                    <Input
                      type="number"
                      min={0}
                      value={item.quantity}
                      onChange={(e) => updateItem(item.key, { quantity: Number(e.target.value) || 0 })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="flex w-28 flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground">Valor unit.</span>
                    <Input
                      type="number"
                      min={0}
                      inputMode="decimal"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.key, { unitPrice: Number(e.target.value) || 0 })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => setItems((current) => (current.length > 1 ? current.filter((i) => i.key !== item.key) : current))}
                    aria-label="Remover item"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" className="w-fit gap-1.5" onClick={() => setItems((current) => [...current, emptyItem()])}>
              <Plus className="size-3.5" />
              Item
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="quote-notes">Observações (opcional)</Label>
            <textarea
              id="quote-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>

          <div className="flex items-center justify-between border-t border-border/60 pt-3">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-lg font-semibold tabular-nums">{currencyFormatter.format(total)}</span>
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar orçamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
