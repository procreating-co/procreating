"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Eye, EyeOff, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SECTION_TYPE_LABEL } from "@/lib/comercial/proposal-content-types";
import type { ProposalSection } from "@/lib/supabase/types/database";
import { cn } from "@/lib/utils";

const textareaClass =
  "w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

/** Um card por seção — formulário específico pro `section_type` (§24 do plano: editar,
 *  reordenar, ocultar, duplicar, remover). Reordenar é por botão (não drag) — mesma decisão de
 *  §27 do Task Intelligence (mobile-safe, sem exigir arrastar); volume de seções por proposta é
 *  baixo (10 no máximo), drag não paga o custo de implementação extra aqui. */
export function SectionEditorCard({
  section,
  isFirst,
  isLast,
  onChange,
  onMove,
  onToggleVisible,
  onDuplicate,
  onRemove,
}: {
  section: ProposalSection;
  isFirst: boolean;
  isLast: boolean;
  onChange: (content: Record<string, unknown>) => void;
  onMove: (direction: "up" | "down") => void;
  onToggleVisible: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const content = section.content as Record<string, any>;

  function set(patch: Record<string, unknown>) {
    onChange({ ...content, ...patch });
  }

  function setListItem(key: string, index: number, value: string) {
    const list = [...(content[key] ?? [])];
    list[index] = value;
    set({ [key]: list });
  }
  function addListItem(key: string) {
    set({ [key]: [...(content[key] ?? []), ""] });
  }
  function removeListItem(key: string, index: number) {
    set({ [key]: (content[key] ?? []).filter((_: unknown, i: number) => i !== index) });
  }

  return (
    <div className={cn("flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-4", !section.visible && "opacity-50")}>
      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={() => setCollapsed((c) => !c)} className="flex items-center gap-2 text-left text-sm font-medium">
          {SECTION_TYPE_LABEL[section.section_type]}
        </button>
        <div className="flex items-center gap-1">
          <button type="button" disabled={isFirst} onClick={() => onMove("up")} className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-30">
            <ChevronUp className="size-3.5" />
          </button>
          <button type="button" disabled={isLast} onClick={() => onMove("down")} className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-30">
            <ChevronDown className="size-3.5" />
          </button>
          <button type="button" onClick={onToggleVisible} aria-label={section.visible ? "Ocultar" : "Mostrar"} className="rounded p-1 text-muted-foreground hover:text-foreground">
            {section.visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
          </button>
          <button type="button" onClick={onDuplicate} aria-label="Duplicar" className="rounded p-1 text-muted-foreground hover:text-foreground">
            <Copy className="size-3.5" />
          </button>
          <button type="button" onClick={onRemove} aria-label="Remover" className="rounded p-1 text-muted-foreground hover:text-destructive">
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="flex flex-col gap-3">
          {"eyebrow" in content && (
            <Field label="Eyebrow">
              <Input value={content.eyebrow ?? ""} onChange={(e) => set({ eyebrow: e.target.value })} />
            </Field>
          )}
          {"title" in content && (
            <Field label="Título">
              <Input value={content.title ?? ""} onChange={(e) => set({ title: e.target.value })} />
            </Field>
          )}
          {"subtitle" in content && (
            <Field label="Subtítulo">
              <textarea rows={2} className={textareaClass} value={content.subtitle ?? ""} onChange={(e) => set({ subtitle: e.target.value })} />
            </Field>
          )}
          {"heading" in content && (
            <Field label="Título da seção">
              <Input value={content.heading ?? ""} onChange={(e) => set({ heading: e.target.value })} />
            </Field>
          )}
          {"body" in content && (
            <Field label="Texto">
              <textarea rows={3} className={textareaClass} value={content.body ?? ""} onChange={(e) => set({ body: e.target.value })} />
            </Field>
          )}
          {"points" in content && (
            <ListField label="Pontos" items={content.points ?? []} onAdd={() => addListItem("points")} onChange={(i, v) => setListItem("points", i, v)} onRemove={(i) => removeListItem("points", i)} />
          )}
          {"items" in content && Array.isArray(content.items) && typeof content.items[0] !== "object" && (
            <ListField label="Itens" items={content.items ?? []} onAdd={() => addListItem("items")} onChange={(i, v) => setListItem("items", i, v)} onRemove={(i) => removeListItem("items", i)} />
          )}
          {section.section_type === "strategy" && (
            <PillarsField
              pillars={content.pillars ?? []}
              onChange={(pillars) => set({ pillars })}
            />
          )}
          {section.section_type === "services" && (
            <ServiceItemsField items={content.items ?? []} onChange={(items) => set({ items })} />
          )}
          {section.section_type === "investment" && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Valor (R$)">
                <Input type="number" min={0} value={content.value ?? 0} onChange={(e) => set({ value: Number(e.target.value) || 0 })} />
              </Field>
              <Field label="Recorrência">
                <select
                  value={content.recurrence ?? "mensal"}
                  onChange={(e) => set({ recurrence: e.target.value })}
                  className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring"
                >
                  <option value="mensal">Mensal</option>
                  <option value="unico">Único</option>
                </select>
              </Field>
              <Field label="Notas">
                <Input value={content.notes ?? ""} onChange={(e) => set({ notes: e.target.value })} />
              </Field>
            </div>
          )}
          {section.section_type === "cta" && (
            <Field label="Texto do botão">
              <Input value={content.buttonLabel ?? ""} onChange={(e) => set({ buttonLabel: e.target.value })} />
            </Field>
          )}
          {"note" in content && (
            <Field label="Observação">
              <Input value={content.note ?? ""} onChange={(e) => set({ note: e.target.value })} />
            </Field>
          )}
          {"text" in content && !("body" in content) && (
            <Field label="Texto">
              <Input value={content.text ?? ""} onChange={(e) => set({ text: e.target.value })} />
            </Field>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ListField({ label, items, onAdd, onChange, onRemove }: { label: string; items: string[]; onAdd: () => void; onChange: (i: number, v: string) => void; onRemove: (i: number) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input value={item} onChange={(e) => onChange(index, e.target.value)} />
          <button type="button" onClick={() => onRemove(index)} className="shrink-0 text-muted-foreground hover:text-destructive">
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ))}
      <button type="button" onClick={onAdd} className="w-fit text-xs text-muted-foreground hover:text-foreground">
        + adicionar
      </button>
    </div>
  );
}

function PillarsField({ pillars, onChange }: { pillars: { title: string; description: string }[]; onChange: (pillars: { title: string; description: string }[]) => void }) {
  function update(index: number, patch: Partial<{ title: string; description: string }>) {
    onChange(pillars.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }
  return (
    <div className="flex flex-col gap-1.5">
      <Label>Pilares</Label>
      {pillars.map((pillar, index) => (
        <div key={index} className="flex flex-col gap-1 rounded-md border border-border/60 p-2">
          <Input placeholder="Título" value={pillar.title} onChange={(e) => update(index, { title: e.target.value })} className="h-7 text-sm" />
          <Input placeholder="Descrição" value={pillar.description} onChange={(e) => update(index, { description: e.target.value })} className="h-7 text-sm" />
          <button type="button" onClick={() => onChange(pillars.filter((_, i) => i !== index))} className="w-fit text-xs text-muted-foreground hover:text-destructive">
            remover
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...pillars, { title: "", description: "" }])} className="w-fit text-xs text-muted-foreground hover:text-foreground">
        + adicionar pilar
      </button>
    </div>
  );
}

function ServiceItemsField({ items, onChange }: { items: { title: string; description: string }[]; onChange: (items: { title: string; description: string }[]) => void }) {
  function update(index: number, patch: Partial<{ title: string; description: string }>) {
    onChange(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }
  return (
    <div className="flex flex-col gap-1.5">
      <Label>Serviços</Label>
      {items.map((item, index) => (
        <div key={index} className="flex flex-col gap-1 rounded-md border border-border/60 p-2">
          <Input placeholder="Título" value={item.title} onChange={(e) => update(index, { title: e.target.value })} className="h-7 text-sm" />
          <Input placeholder="Descrição" value={item.description} onChange={(e) => update(index, { description: e.target.value })} className="h-7 text-sm" />
          <button type="button" onClick={() => onChange(items.filter((_, i) => i !== index))} className="w-fit text-xs text-muted-foreground hover:text-destructive">
            remover
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, { title: "", description: "" }])} className="w-fit text-xs text-muted-foreground hover:text-foreground">
        + adicionar serviço
      </button>
    </div>
  );
}
