"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStrategies } from "@/components/prospeccao/strategies-store";
import { useScripts } from "@/components/prospeccao/scripts-store";
import { STRATEGY_CATEGORY_LABEL, STRATEGY_CATEGORY_ORDER } from "@/lib/prospeccao/strategies-data";
import type { Strategy, StrategyCategory, StrategyInput } from "@/lib/prospeccao/types";
import { cn } from "@/lib/utils";

const EMPTY_INPUT: StrategyInput = { category: "abordagem", title: "", objective: "", context: "", steps: [], relatedScriptIds: [], notes: "" };

function StrategyFormDialog({
  open,
  onOpenChange,
  strategy,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  strategy?: Strategy;
  onSubmit: (input: StrategyInput) => void;
}) {
  const { scripts } = useScripts();
  const [input, setInput] = useState<StrategyInput>(EMPTY_INPUT);
  const [stepsText, setStepsText] = useState("");
  const isEditing = Boolean(strategy);

  useEffect(() => {
    if (!open) return;
    const base = strategy
      ? { category: strategy.category, title: strategy.title, objective: strategy.objective, context: strategy.context, steps: strategy.steps, relatedScriptIds: strategy.relatedScriptIds, notes: strategy.notes }
      : EMPTY_INPUT;
    setInput(base);
    setStepsText(base.steps.join("\n"));
  }, [open, strategy]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ ...input, steps: stepsText.split("\n").map((s) => s.trim()).filter(Boolean) });
    onOpenChange(false);
  }

  function toggleScript(id: string) {
    setInput((prev) => ({
      ...prev,
      relatedScriptIds: prev.relatedScriptIds.includes(id) ? prev.relatedScriptIds.filter((s) => s !== id) : [...prev.relatedScriptIds, id],
    }));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit} className="flex max-h-[80vh] flex-col gap-6 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar estratégia" : "Nova estratégia"}</DialogTitle>
            <DialogDescription>Organize o raciocínio por trás de uma abordagem — não precisa ser operacional como um script.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="strategy-title">Título</Label>
              <Input id="strategy-title" value={input.title} onChange={(e) => setInput((p) => ({ ...p, title: e.target.value }))} placeholder="Primeira abordagem" required autoFocus />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="strategy-category">Categoria</Label>
              <select
                id="strategy-category"
                value={input.category}
                onChange={(e) => setInput((p) => ({ ...p, category: e.target.value as StrategyCategory }))}
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {STRATEGY_CATEGORY_ORDER.map((c) => (
                  <option key={c} value={c}>
                    {STRATEGY_CATEGORY_LABEL[c]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="strategy-objective">Objetivo</Label>
              <Input id="strategy-objective" value={input.objective} onChange={(e) => setInput((p) => ({ ...p, objective: e.target.value }))} required />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="strategy-context">Contexto</Label>
              <textarea
                id="strategy-context"
                value={input.context}
                onChange={(e) => setInput((p) => ({ ...p, context: e.target.value }))}
                rows={2}
                className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="strategy-steps">Passo a passo (um por linha)</Label>
              <textarea
                id="strategy-steps"
                value={stepsText}
                onChange={(e) => setStepsText(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </div>

            {scripts.length > 0 && (
              <div className="flex flex-col gap-2">
                <Label>Scripts relacionados</Label>
                <div className="flex flex-wrap gap-2">
                  {scripts.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleScript(s.id)}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-xs transition-colors",
                        input.relatedScriptIds.includes(s.id) ? "border-ring bg-accent text-accent-foreground" : "border-input text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {s.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="strategy-notes">Observações</Label>
              <textarea
                id="strategy-notes"
                value={input.notes}
                onChange={(e) => setInput((p) => ({ ...p, notes: e.target.value }))}
                rows={2}
                className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[var(--client-accent)] text-black hover:opacity-90">
              {isEditing ? "Salvar" : "Criar estratégia"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function StrategyCard({ strategy, onEdit }: { strategy: Strategy; onEdit: () => void }) {
  const { scripts } = useScripts();
  const [expanded, setExpanded] = useState(false);
  const relatedScripts = scripts.filter((s) => strategy.relatedScriptIds.includes(s.id));

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <button type="button" onClick={() => setExpanded((v) => !v)} className="flex w-full items-start justify-between gap-3 text-left">
        <div>
          <h3 className="text-sm font-medium text-white">{strategy.title}</h3>
          <p className="mt-0.5 text-xs text-white/50">{strategy.objective}</p>
        </div>
        <ChevronDown className={cn("mt-0.5 size-4 shrink-0 text-white/40 transition-transform", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 text-sm">
          {strategy.context && <p className="text-white/60">{strategy.context}</p>}

          {strategy.steps.length > 0 && (
            <ol className="flex flex-col gap-1.5">
              {strategy.steps.map((step, i) => (
                <li key={i} className="flex gap-2 text-white/70">
                  <span className="font-mono text-xs text-[var(--client-accent)]">{String(i + 1).padStart(2, "0")}</span>
                  {step}
                </li>
              ))}
            </ol>
          )}

          {relatedScripts.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {relatedScripts.map((s) => (
                <span key={s.id} className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/50">
                  {s.title}
                </span>
              ))}
            </div>
          )}

          {strategy.notes && <p className="text-xs italic text-white/40">{strategy.notes}</p>}

          <Button type="button" size="sm" variant="outline" onClick={onEdit} className="self-start border-white/15 bg-transparent text-white hover:bg-white/10">
            Editar
          </Button>
        </div>
      )}
    </div>
  );
}

export function EstrategiasView() {
  const { strategies, addStrategy, updateStrategy } = useStrategies();
  const [category, setCategory] = useState<StrategyCategory | "todos">("todos");
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Strategy | null>(null);

  const visibleStrategies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return strategies.filter((s) => {
      const matchesCategory = category === "todos" || s.category === category;
      const matchesQuery = !normalizedQuery || s.title.toLowerCase().includes(normalizedQuery) || s.objective.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [strategies, category, query]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar estratégia..." className="border-white/15 bg-white/[0.03] pl-9 text-white placeholder:text-white/40" />
        </div>
        <Button type="button" onClick={() => setCreating(true)} className="ml-auto gap-2 bg-[var(--client-accent)] text-black hover:opacity-90">
          <Plus className="size-4" />
          Nova estratégia
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory("todos")}
          className={cn(
            "rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-wide transition-colors",
            category === "todos" ? "border-[var(--client-accent)] bg-[var(--client-accent)]/10 text-[var(--client-accent)]" : "border-white/15 text-white/50 hover:text-white",
          )}
        >
          Todas
        </button>
        {STRATEGY_CATEGORY_ORDER.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={cn(
              "rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-wide transition-colors",
              category === c ? "border-[var(--client-accent)] bg-[var(--client-accent)]/10 text-[var(--client-accent)]" : "border-white/15 text-white/50 hover:text-white",
            )}
          >
            {STRATEGY_CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>

      {visibleStrategies.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] px-6 py-16 text-center text-white/40">Nenhuma estratégia encontrada.</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {visibleStrategies.map((strategy) => (
            <StrategyCard key={strategy.id} strategy={strategy} onEdit={() => setEditing(strategy)} />
          ))}
        </div>
      )}

      <StrategyFormDialog open={creating} onOpenChange={setCreating} onSubmit={addStrategy} />
      <StrategyFormDialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)} strategy={editing ?? undefined} onSubmit={(input) => editing && updateStrategy(editing.id, input)} />
    </div>
  );
}
