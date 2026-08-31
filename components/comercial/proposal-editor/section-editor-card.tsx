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
 *  reordenar, ocultar, duplicar, remover). Os 7 tipos espelham os componentes reais de
 *  `components/proposal/**` (Elenita, agora o template padrão) — ver `proposal-content-types.ts`.
 *  Reordenar é por botão (não drag) — mesma decisão de §27 do Task Intelligence (mobile-safe,
 *  sem exigir arrastar); volume de seções por proposta é fixo em 7, drag não paga o custo aqui. */
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
          {/* Campos genéricos — presentes em vários tipos com o mesmo nome/semântica */}
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
          {"paragraph" in content && (
            <Field label="Texto">
              <textarea rows={3} className={textareaClass} value={content.paragraph ?? ""} onChange={(e) => set({ paragraph: e.target.value })} />
            </Field>
          )}

          {/* pillars — intro + lista de pilares (número/título/descrição/itens) */}
          {section.section_type === "pillars" && (
            <>
              <Field label="Introdução — eyebrow">
                <Input value={content.intro?.eyebrow ?? ""} onChange={(e) => set({ intro: { ...content.intro, eyebrow: e.target.value } })} />
              </Field>
              <Field label="Introdução — título">
                <Input value={content.intro?.heading ?? ""} onChange={(e) => set({ intro: { ...content.intro, heading: e.target.value } })} />
              </Field>
              <Field label="Introdução — subtítulo">
                <textarea rows={2} className={textareaClass} value={content.intro?.subtitle ?? ""} onChange={(e) => set({ intro: { ...content.intro, subtitle: e.target.value } })} />
              </Field>
              <NumberedCardsField label="Pilares" cards={content.pillars ?? []} withDescription onChange={(pillars) => set({ pillars })} />
            </>
          )}

          {/* roadmap — lista de etapas (número/título/itens, sem descrição) */}
          {section.section_type === "roadmap" && (
            <NumberedCardsField label="Etapas" cards={content.stages ?? []} onChange={(stages) => set({ stages })} />
          )}

          {/* tv_program — passos do fluxo (lista simples de texto) */}
          {section.section_type === "tv_program" && (
            <ListField label="Passos" items={content.steps ?? []} onAdd={() => addListItem("steps")} onChange={(i, v) => setListItem("steps", i, v)} onRemove={(i) => removeListItem("steps", i)} />
          )}

          {/* acquisition — cards (número/título/descrição/itens), mesmo shape de pillars */}
          {section.section_type === "acquisition" && (
            <NumberedCardsField label="Cards" cards={content.cards ?? []} withDescription onChange={(cards) => set({ cards })} />
          )}

          {/* budget — número + label + caption + recorrência, 4 blocos-pilar, incluso/adicionais, fluxo */}
          {section.section_type === "budget" && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Valor (R$)">
                  <Input type="number" min={0} value={content.heroNumber ?? 0} onChange={(e) => set({ heroNumber: Number(e.target.value) || 0 })} />
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
                <Field label="Rótulo do valor">
                  <Input value={content.heroLabel ?? ""} onChange={(e) => set({ heroLabel: e.target.value })} />
                </Field>
                <Field label="Legenda">
                  <Input value={content.heroCaption ?? ""} onChange={(e) => set({ heroCaption: e.target.value })} />
                </Field>
              </div>
              <TitledListsField label="Blocos" items={content.pillars ?? []} onChange={(pillars) => set({ pillars })} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Rótulo — incluso">
                  <Input value={content.includedLabel ?? ""} onChange={(e) => set({ includedLabel: e.target.value })} />
                </Field>
                <Field label="Rótulo — adicionais">
                  <Input value={content.additionalLabel ?? ""} onChange={(e) => set({ additionalLabel: e.target.value })} />
                </Field>
              </div>
              <ListField
                label="Itens inclusos"
                items={content.includedItems ?? []}
                onAdd={() => addListItem("includedItems")}
                onChange={(i, v) => setListItem("includedItems", i, v)}
                onRemove={(i) => removeListItem("includedItems", i)}
              />
              <ListField
                label="Itens adicionais"
                items={content.additionalItems ?? []}
                onAdd={() => addListItem("additionalItems")}
                onChange={(i, v) => setListItem("additionalItems", i, v)}
                onRemove={(i) => removeListItem("additionalItems", i)}
              />
              <ListField
                label="Passos do fluxo"
                items={content.flowSteps ?? []}
                onAdd={() => addListItem("flowSteps")}
                onChange={(i, v) => setListItem("flowSteps", i, v)}
                onRemove={(i) => removeListItem("flowSteps", i)}
              />
            </div>
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

type NumberedCard = { number: string; title: string; description?: string; items: string[] };

/** Cards numerados (número/título/[descrição]/itens) — mesmo shape usado por `pillars.pillars`,
 *  `roadmap.stages` (sem descrição) e `acquisition.cards`. Um componente só, 3 usos. */
function NumberedCardsField({ label, cards, withDescription, onChange }: { label: string; cards: NumberedCard[]; withDescription?: boolean; onChange: (cards: NumberedCard[]) => void }) {
  function update(index: number, patch: Partial<NumberedCard>) {
    onChange(cards.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  }
  function updateItem(cardIndex: number, itemIndex: number, value: string) {
    const items = [...cards[cardIndex].items];
    items[itemIndex] = value;
    update(cardIndex, { items });
  }
  function addItem(cardIndex: number) {
    update(cardIndex, { items: [...cards[cardIndex].items, ""] });
  }
  function removeItem(cardIndex: number, itemIndex: number) {
    update(cardIndex, { items: cards[cardIndex].items.filter((_, i) => i !== itemIndex) });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {cards.map((card, index) => (
        <div key={index} className="flex flex-col gap-1.5 rounded-md border border-border/60 p-2.5">
          <div className="flex items-center gap-2">
            <Input placeholder="Nº" value={card.number} onChange={(e) => update(index, { number: e.target.value })} className="h-7 w-14 text-sm" />
            <Input placeholder="Título" value={card.title} onChange={(e) => update(index, { title: e.target.value })} className="h-7 text-sm" />
          </div>
          {withDescription && <Input placeholder="Descrição" value={card.description ?? ""} onChange={(e) => update(index, { description: e.target.value })} className="h-7 text-sm" />}
          <div className="flex flex-col gap-1 pl-2">
            {card.items.map((item, itemIndex) => (
              <div key={itemIndex} className="flex items-center gap-1.5">
                <Input placeholder="Item" value={item} onChange={(e) => updateItem(index, itemIndex, e.target.value)} className="h-7 text-xs" />
                <button type="button" onClick={() => removeItem(index, itemIndex)} className="shrink-0 text-muted-foreground hover:text-destructive">
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addItem(index)} className="w-fit text-xs text-muted-foreground hover:text-foreground">
              + item
            </button>
          </div>
          <button type="button" onClick={() => onChange(cards.filter((_, i) => i !== index))} className="w-fit text-xs text-muted-foreground hover:text-destructive">
            remover card
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...cards, withDescription ? { number: "", title: "", description: "", items: [] } : { number: "", title: "", items: [] }])}
        className="w-fit text-xs text-muted-foreground hover:text-foreground"
      >
        + adicionar
      </button>
    </div>
  );
}

type TitledList = { title: string; items: string[] };

/** Blocos "título + lista de itens", sem número — usado por `budget.pillars` (4 blocos:
 *  Estratégia/Conteúdo/Gestão/Produção na Elenita). */
function TitledListsField({ label, items, onChange }: { label: string; items: TitledList[]; onChange: (items: TitledList[]) => void }) {
  function update(index: number, patch: Partial<TitledList>) {
    onChange(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }
  function updateItem(blockIndex: number, itemIndex: number, value: string) {
    const list = [...items[blockIndex].items];
    list[itemIndex] = value;
    update(blockIndex, { items: list });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {items.map((block, index) => (
        <div key={index} className="flex flex-col gap-1.5 rounded-md border border-border/60 p-2.5">
          <Input placeholder="Título" value={block.title} onChange={(e) => update(index, { title: e.target.value })} className="h-7 text-sm" />
          <div className="flex flex-col gap-1 pl-2">
            {block.items.map((item, itemIndex) => (
              <div key={itemIndex} className="flex items-center gap-1.5">
                <Input
                  placeholder="Item"
                  value={item}
                  onChange={(e) => updateItem(index, itemIndex, e.target.value)}
                  className="h-7 text-xs"
                />
                <button
                  type="button"
                  onClick={() => update(index, { items: block.items.filter((_, i) => i !== itemIndex) })}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => update(index, { items: [...block.items, ""] })} className="w-fit text-xs text-muted-foreground hover:text-foreground">
              + item
            </button>
          </div>
          <button type="button" onClick={() => onChange(items.filter((_, i) => i !== index))} className="w-fit text-xs text-muted-foreground hover:text-destructive">
            remover bloco
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, { title: "", items: [] }])} className="w-fit text-xs text-muted-foreground hover:text-foreground">
        + adicionar bloco
      </button>
    </div>
  );
}
