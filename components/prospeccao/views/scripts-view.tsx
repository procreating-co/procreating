"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, MessageCircle, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useScripts } from "@/components/prospeccao/scripts-store";
import { useOficinas } from "@/components/prospeccao/oficinas-store";
import { SCRIPT_CATEGORY_LABEL, SCRIPT_CATEGORY_ORDER } from "@/lib/prospeccao/scripts-data";
import { renderScriptTemplate, buildWhatsAppUrl, SCRIPT_VARIABLES } from "@/lib/prospeccao/template";
import type { Script, ScriptCategory, ScriptInput } from "@/lib/prospeccao/types";
import { cn } from "@/lib/utils";

const EMPTY_INPUT: ScriptInput = { title: "", category: "primeiro_contato", objective: "", channel: "whatsapp", body: "" };

function ScriptFormDialog({
  open,
  onOpenChange,
  script,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  script?: Script;
  onSubmit: (input: ScriptInput) => void;
}) {
  const [input, setInput] = useState<ScriptInput>(EMPTY_INPUT);
  const isEditing = Boolean(script);

  useEffect(() => {
    if (!open) return;
    setInput(script ? { title: script.title, category: script.category, objective: script.objective, channel: script.channel, body: script.body } : EMPTY_INPUT);
  }, [open, script]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(input);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar script" : "Novo script"}</DialogTitle>
            <DialogDescription>Use variáveis como {"{{responsavel}}"}, {"{{oficina}}"} e {"{{cidade}}"} — elas são preenchidas na hora de usar o script.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="script-title">Título</Label>
              <Input id="script-title" value={input.title} onChange={(e) => setInput((p) => ({ ...p, title: e.target.value }))} placeholder="Primeiro contato — Oficina" required autoFocus />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="script-category">Categoria</Label>
                <select
                  id="script-category"
                  value={input.category}
                  onChange={(e) => setInput((p) => ({ ...p, category: e.target.value as ScriptCategory }))}
                  className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  {SCRIPT_CATEGORY_ORDER.map((c) => (
                    <option key={c} value={c}>
                      {SCRIPT_CATEGORY_LABEL[c]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="script-objective">Objetivo</Label>
                <Input id="script-objective" value={input.objective} onChange={(e) => setInput((p) => ({ ...p, objective: e.target.value }))} placeholder="Primeira abordagem" required />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="script-body">Texto</Label>
              <textarea
                id="script-body"
                value={input.body}
                onChange={(e) => setInput((p) => ({ ...p, body: e.target.value }))}
                placeholder="Olá, {{responsavel}}! ..."
                rows={5}
                required
                className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
              <p className="text-xs text-muted-foreground">{SCRIPT_VARIABLES.map((v) => v.token).join("  ·  ")}</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[var(--client-accent)] text-black hover:opacity-90">
              {isEditing ? "Salvar" : "Criar script"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function UseScriptDialog({ script, onOpenChange }: { script: Script | null; onOpenChange: (open: boolean) => void }) {
  const { oficinas, logOficinaEvent } = useOficinas();
  const [oficinaId, setOficinaId] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (script) setOficinaId("");
  }, [script]);

  if (!script) return null;

  const oficina = oficinas.find((o) => o.id === oficinaId) ?? null;
  const rendered = oficina ? renderScriptTemplate(script.body, oficina) : script.body;

  async function handleCopy() {
    await navigator.clipboard.writeText(rendered);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <Dialog open={script !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Usar script — {script.title}</DialogTitle>
          <DialogDescription>Escolha uma oficina pra preencher as variáveis automaticamente (opcional).</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="use-script-oficina">Oficina</Label>
            <select
              id="use-script-oficina"
              value={oficinaId}
              onChange={(e) => setOficinaId(e.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="">Sem oficina selecionada</option>
              {oficinas.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nome}
                  {o.responsavel ? ` — ${o.responsavel}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border border-input bg-muted/30 p-4 text-sm whitespace-pre-wrap">{rendered}</div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="outline" onClick={handleCopy} className="gap-2">
            {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
            {copied ? "Copiado" : "Copiar"}
          </Button>
          <Button
            asChild={Boolean(oficina)}
            type={oficina ? undefined : "button"}
            disabled={!oficina}
            className="gap-2 bg-[var(--client-accent)] text-black hover:opacity-90 disabled:opacity-40"
            onClick={() => {
              if (!oficina) return;
              logOficinaEvent(oficina.id, `Script enviado: ${script.title}`, true);
            }}
          >
            {oficina ? (
              <a href={buildWhatsAppUrl(oficina.whatsapp, rendered)} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-4" />
                Abrir WhatsApp
              </a>
            ) : (
              <span className="inline-flex items-center gap-2">
                <MessageCircle className="size-4" />
                Selecione uma oficina
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ScriptCard({ script, onEdit, onUse, onDelete }: { script: Script; onEdit: () => void; onUse: () => void; onDelete: () => void }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(script.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-medium text-white">{script.title}</h3>
          <p className="mt-0.5 text-xs text-white/45">{script.objective}</p>
        </div>
        <span className="shrink-0 rounded-full border border-white/15 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] uppercase text-white/50">WhatsApp</span>
      </div>

      <p className="line-clamp-3 text-xs text-white/55">{script.body}</p>

      <div className="mt-1 flex items-center gap-1">
        <Button type="button" size="sm" variant="ghost" onClick={handleCopy} className="gap-1.5 text-white/70 hover:bg-white/10 hover:text-white">
          {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
          Copiar
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onEdit} className="gap-1.5 text-white/70 hover:bg-white/10 hover:text-white">
          <Pencil className="size-3.5" />
          Editar
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDelete} className="gap-1.5 text-red-400 hover:bg-red-500/10 hover:text-red-300">
          <Trash2 className="size-3.5" />
        </Button>
        <Button type="button" size="sm" onClick={onUse} className="ml-auto gap-1.5 bg-[var(--client-accent)] text-black hover:opacity-90">
          <MessageCircle className="size-3.5" />
          Usar script
        </Button>
      </div>
    </div>
  );
}

export function ScriptsView() {
  const { scripts, addScript, updateScript, removeScript } = useScripts();
  const [category, setCategory] = useState<ScriptCategory | "todos">("todos");
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Script | null>(null);
  const [using, setUsing] = useState<Script | null>(null);
  const [deleting, setDeleting] = useState<Script | null>(null);

  const visibleScripts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return scripts.filter((script) => {
      const matchesCategory = category === "todos" || script.category === category;
      const matchesQuery = !normalizedQuery || script.title.toLowerCase().includes(normalizedQuery) || script.body.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [scripts, category, query]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar script..." className="border-white/15 bg-white/[0.03] pl-9 text-white placeholder:text-white/40" />
        </div>
        <Button type="button" onClick={() => setCreating(true)} className="ml-auto gap-2 bg-[var(--client-accent)] text-black hover:opacity-90">
          <Plus className="size-4" />
          Novo script
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
          Todos
        </button>
        {SCRIPT_CATEGORY_ORDER.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={cn(
              "rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-wide transition-colors",
              category === c ? "border-[var(--client-accent)] bg-[var(--client-accent)]/10 text-[var(--client-accent)]" : "border-white/15 text-white/50 hover:text-white",
            )}
          >
            {SCRIPT_CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>

      {visibleScripts.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] px-6 py-16 text-center text-white/40">Nenhum script encontrado.</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleScripts.map((script) => (
            <ScriptCard key={script.id} script={script} onEdit={() => setEditing(script)} onUse={() => setUsing(script)} onDelete={() => setDeleting(script)} />
          ))}
        </div>
      )}

      <ScriptFormDialog open={creating} onOpenChange={setCreating} onSubmit={addScript} />
      <ScriptFormDialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)} script={editing ?? undefined} onSubmit={(input) => editing && updateScript(editing.id, input)} />
      <UseScriptDialog script={using} onOpenChange={(open) => !open && setUsing(null)} />

      <Dialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir script?</DialogTitle>
            <DialogDescription>{deleting ? `"${deleting.title}" será removido da biblioteca. Essa ação não pode ser desfeita.` : ""}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleting(null)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (deleting) removeScript(deleting.id);
                setDeleting(null);
              }}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
