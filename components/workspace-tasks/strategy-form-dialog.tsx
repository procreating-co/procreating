"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTaskStrategyAction } from "@/lib/tasks/strategy-actions";

type DraftItem = { title: string; estimatedMinutes: string };

/**
 * Criação de molde (§13) — "fundação correta, não excessivamente complexa": título + lista de
 * itens (título + duração opcional), reordenar é só editar a ordem na lista (arrastar não vale
 * a pena aqui, molde tem poucos itens e é editado raramente). "Encadear" marca cada item como
 * dependente do anterior — checklist sequencial, o caso real do pedido (Roteiro → Aprovação →
 * Captação → Edição → Revisão → Publicação).
 */
export function StrategyFormDialog({
  open,
  onOpenChange,
  initialTitle = "",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** `/strategy <nome>` (§20) sem molde existente com esse nome — abre já criando um novo, o
   *  nome digitado não se perde. */
  initialTitle?: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<DraftItem[]>([{ title: "", estimatedMinutes: "" }]);
  const [chainDependencies, setChainDependencies] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateItem(index: number, patch: Partial<DraftItem>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function addItem() {
    setItems((prev) => [...prev, { title: "", estimatedMinutes: "" }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createTaskStrategyAction(
        title,
        description.trim() || null,
        items.map((item) => ({ title: item.title, estimatedMinutes: item.estimatedMinutes ? Number(item.estimatedMinutes) : null })),
        chainDependencies,
      );
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setTitle("");
      setDescription("");
      setItems([{ title: "", estimatedMinutes: "" }]);
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-5">
        <DialogHeader>
          <DialogTitle>Nova estratégia</DialogTitle>
          <DialogDescription>Um molde de tarefas reaproveitável — ex.: &ldquo;Lançamento de cliente&rdquo;.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="strategy-title">Nome</Label>
            <Input id="strategy-title" value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="strategy-description">Descrição (opcional)</Label>
            <Input id="strategy-description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Tarefas do molde</Label>
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input value={item.title} onChange={(e) => updateItem(index, { title: e.target.value })} placeholder={`Item ${index + 1}`} className="flex-1" />
                <Input
                  type="number"
                  min={1}
                  value={item.estimatedMinutes}
                  onChange={(e) => updateItem(index, { estimatedMinutes: e.target.value })}
                  placeholder="min"
                  className="w-20"
                />
                <button type="button" onClick={() => removeItem(index)} aria-label="Remover item" className="shrink-0 rounded p-1.5 text-muted-foreground hover:text-destructive">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="w-fit gap-1.5">
              <Plus className="size-3.5" />
              Adicionar item
            </Button>
          </div>

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={chainDependencies} onChange={(e) => setChainDependencies(e.target.checked)} className="size-3.5" />
            Cada item depende do anterior (checklist sequencial)
          </label>

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
              {isPending ? "Criando..." : "Criar estratégia"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
