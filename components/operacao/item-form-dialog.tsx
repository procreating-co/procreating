"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createProductionItemAction } from "@/lib/operacao/actions";
import { PRODUCTION_ITEM_STATUS_PRESETS } from "@/lib/operacao/types";
import type { Client, ProductionItemKind } from "@/lib/supabase/types/database";

const KIND_DIALOG_TITLE: Record<ProductionItemKind, string> = { producao: "Novo conteúdo", entrega: "Nova entrega", conteudo: "Novo conteúdo" };

/** Mesmo padrão de `components/operacao/project-form-dialog.tsx` — só o essencial (título +
 *  cliente opcional), status entra sempre no primeiro preset da lista (o mais inicial do fluxo),
 *  editável depois via `ItemStatusSelect` sem precisar reabrir esse formulário. */
export function ItemFormDialog({ open, onOpenChange, kind, clients }: { open: boolean; onOpenChange: (open: boolean) => void; kind: ProductionItemKind; clients: Client[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const firstPreset = PRODUCTION_ITEM_STATUS_PRESETS[kind][0];
    startTransition(async () => {
      const result = await createProductionItemAction({
        kind,
        title,
        clientId: clientId || null,
        productionProjectId: null,
        statusLabel: firstPreset.label,
        statusTone: firstPreset.tone,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setTitle("");
      setClientId("");
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>{KIND_DIALOG_TITLE[kind]}</DialogTitle>
            <DialogDescription>Entra como &ldquo;{PRODUCTION_ITEM_STATUS_PRESETS[kind][0].label}&rdquo; — mude o status na lista quando avançar.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="item-title">Título</Label>
              <Input id="item-title" value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="item-client">Cliente</Label>
              <select
                id="item-client"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value="">Sem cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
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
            <Button type="submit" disabled={isPending || !title.trim()}>
              {isPending ? "Criando..." : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
