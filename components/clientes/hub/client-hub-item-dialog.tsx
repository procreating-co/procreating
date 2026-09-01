"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createProductionItemAction, updateProductionItemDetailsAction } from "@/lib/operacao/actions";
import { PRODUCTION_ITEM_STATUS_PRESETS } from "@/lib/operacao/types";
import type { ProductionItemWithAssignee } from "@/lib/operacao/queries";
import type { User } from "@/lib/supabase/types/database";

export type ClientHubItemVariant = "calendar" | "roteiro" | "story";

const VARIANT_FORMAT = { calendar: "post", roteiro: "roteiro", story: "story" } as const;
const VARIANT_TITLE_LABEL = { calendar: "Conteúdo", roteiro: "Nome do roteiro", story: "Tema" };
const VARIANT_CREATE_LABEL = { calendar: "Novo conteúdo", roteiro: "Novo roteiro", story: "Novo story" };

/**
 * Dialog único de criação/edição pras 3 seções do Client Hub (Cronograma/Roteiros/Stories) —
 * mesma tabela (`production_items`, `kind='conteudo'`), só o `format` e os campos extras mudam
 * por `variant`, então um componente parametrizado em vez de 3 quase-idênticos. Sem `item` =
 * criação (`createProductionItemAction`); com `item` = edição de detalhes
 * (`updateProductionItemDetailsAction` — status continua fora daqui, editável inline por
 * `ItemStatusSelect`, mesmo padrão das outras 3 páginas de Operação).
 */
export function ClientHubItemDialog({
  open,
  onOpenChange,
  clientId,
  variant,
  item,
  users,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  variant: ClientHubItemVariant;
  item?: ProductionItemWithAssignee;
  users: User[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(item?.title ?? "");
  const [channel, setChannel] = useState(item?.channel ?? "");
  const [scheduledDate, setScheduledDate] = useState(item?.scheduled_date ?? "");
  const [assignedTo, setAssignedTo] = useState(item?.assigned_to ?? "");
  const [notes, setNotes] = useState(item?.notes ?? "");
  const [scriptBody, setScriptBody] = useState(item?.script_body ?? "");
  const [storySequence, setStorySequence] = useState(item?.story_sequence != null ? String(item.story_sequence) : "");
  const [storyObjective, setStoryObjective] = useState(item?.story_objective ?? "");
  const [storyDirection, setStoryDirection] = useState(item?.story_direction ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isEditing = Boolean(item);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = isEditing
        ? await updateProductionItemDetailsAction(item!.id, clientId, {
            title,
            channel: channel || null,
            scheduledDate: scheduledDate || null,
            assignedTo: assignedTo || null,
            notes: notes || null,
            scriptBody: variant === "roteiro" ? scriptBody || null : undefined,
            storySequence: variant === "story" ? (storySequence ? Number(storySequence) : null) : undefined,
            storyObjective: variant === "story" ? storyObjective || null : undefined,
            storyDirection: variant === "story" ? storyDirection || null : undefined,
          })
        : await createProductionItemAction({
            kind: "conteudo",
            title,
            clientId,
            productionProjectId: null,
            statusLabel: PRODUCTION_ITEM_STATUS_PRESETS.conteudo[0].label,
            statusTone: PRODUCTION_ITEM_STATUS_PRESETS.conteudo[0].tone,
            format: VARIANT_FORMAT[variant],
            channel: channel || null,
            scheduledDate: scheduledDate || null,
            assignedTo: assignedTo || null,
            notes: notes || null,
            scriptBody: variant === "roteiro" ? scriptBody || null : null,
            storySequence: variant === "story" && storySequence ? Number(storySequence) : null,
            storyObjective: variant === "story" ? storyObjective || null : null,
            storyDirection: variant === "story" ? storyDirection || null : null,
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
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>{isEditing ? title || VARIANT_CREATE_LABEL[variant] : VARIANT_CREATE_LABEL[variant]}</DialogTitle>
            {!isEditing && <DialogDescription>Entra como &ldquo;{PRODUCTION_ITEM_STATUS_PRESETS.conteudo[0].label}&rdquo; — mude o status na lista depois.</DialogDescription>}
          </DialogHeader>

          <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
            <div className="flex flex-col gap-2">
              <Label htmlFor="hub-item-title">{VARIANT_TITLE_LABEL[variant]}</Label>
              <Input id="hub-item-title" value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="hub-item-date">Data</Label>
                <Input id="hub-item-date" type="date" value={scheduledDate ?? ""} onChange={(e) => setScheduledDate(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="hub-item-assignee">Responsável</Label>
                <select
                  id="hub-item-assignee"
                  value={assignedTo ?? ""}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <option value="">Sem responsável</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {variant === "calendar" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="hub-item-channel">Canal</Label>
                <Input id="hub-item-channel" placeholder="Instagram, TikTok, YouTube..." value={channel ?? ""} onChange={(e) => setChannel(e.target.value)} />
              </div>
            )}

            {variant === "roteiro" && (
              <>
                <div className="flex flex-col gap-2">
                  {/* Mesma coluna `channel` da tabela, só rotulada diferente aqui — pro roteiro faz
                   *  mais sentido como "pra que formato é esse roteiro" do que "canal". */}
                  <Label htmlFor="hub-item-channel">Tipo de conteúdo</Label>
                  <Input id="hub-item-channel" placeholder="Reels, vídeo longo, carrossel..." value={channel ?? ""} onChange={(e) => setChannel(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="hub-item-script">Roteiro completo</Label>
                  <Textarea id="hub-item-script" rows={10} value={scriptBody ?? ""} onChange={(e) => setScriptBody(e.target.value)} />
                </div>
              </>
            )}

            {variant === "story" && (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="hub-item-sequence">Sequência</Label>
                    <Input id="hub-item-sequence" type="number" min={1} value={storySequence} onChange={(e) => setStorySequence(e.target.value)} />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="hub-item-objective">Objetivo</Label>
                  <Input id="hub-item-objective" placeholder="Ex.: gerar identificação com a marca" value={storyObjective ?? ""} onChange={(e) => setStoryObjective(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="hub-item-direction">Direcionamento</Label>
                  <Textarea id="hub-item-direction" rows={3} value={storyDirection ?? ""} onChange={(e) => setStoryDirection(e.target.value)} />
                </div>
              </>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="hub-item-notes">Observações</Label>
              <Textarea id="hub-item-notes" rows={3} value={notes ?? ""} onChange={(e) => setNotes(e.target.value)} />
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
              {isPending ? "Salvando..." : isEditing ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
