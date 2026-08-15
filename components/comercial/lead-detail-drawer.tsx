"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { StatusDot, type StatusTone } from "@/components/dashboard/status-dot";
import { QuoteBuilderDialog } from "@/components/comercial/quote-builder-dialog";
import { getLeadEventsAction, logLeadActivityAction, updateLeadAction } from "@/lib/comercial/actions";
import { getQuotesForLeadAction } from "@/lib/comercial/quote-actions";
import { stageColorClasses } from "@/lib/comercial/stage-colors";
import type { Event, QuoteStatus, User } from "@/lib/supabase/types/database";
import type { QuoteWithItems } from "@/lib/comercial/quotes";
import type { LeadPatch, LeadWithRelations } from "@/lib/comercial/types";
import { cn } from "@/lib/utils";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const QUOTE_STATUS_LABEL: Record<QuoteStatus, string> = { rascunho: "Rascunho", enviado: "Enviado", aceito: "Aceito", recusado: "Recusado" };
const QUOTE_STATUS_TONE: Record<QuoteStatus, StatusTone> = { rascunho: "neutral", enviado: "pending", aceito: "active", recusado: "danger" };

function toPatch(lead: LeadWithRelations): LeadPatch {
  return {
    contactName: lead.contact_name ?? "",
    roleTitle: lead.role_title ?? "",
    whatsapp: lead.whatsapp ?? "",
    email: lead.email ?? "",
    potentialValue: lead.potential_value,
    ownerId: lead.owner_id,
    nextContactAt: lead.next_contact_at,
    notes: lead.notes ?? "",
    cnpjCpf: lead.cnpj_cpf ?? "",
    city: lead.city ?? "",
    state: lead.state ?? "",
  };
}

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

/**
 * Drawer lateral (era `lead-detail-dialog.tsx`, modal centralizado) — mesmo conteúdo/campos/
 * histórico de sempre, só o container mudou pra `Sheet` (`components/ui/sheet.tsx`, já existe,
 * já usado pelo drawer mobile da sidebar — primeira vez usado pra detalhe de entidade). Manter
 * o foco no que estava aberto sem tirar a tela inteira do usuário, mesmo padrão de Linear/Apple
 * ("abrir drawer, não navegar pra uma página nova").
 */
export function LeadDetailDrawer({ lead, users, onOpenChange }: { lead: LeadWithRelations | null; users: User[]; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [patch, setPatch] = useState<LeadPatch>({});
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [quotes, setQuotes] = useState<QuoteWithItems[]>([]);
  const [quoteBuilderOpen, setQuoteBuilderOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!lead) return;
    setPatch(toPatch(lead));
    setError(null);
    setNote("");
    setEvents([]);
    setQuotes([]);
    getLeadEventsAction(lead.id).then(setEvents);
    getQuotesForLeadAction(lead.id).then(setQuotes);
  }, [lead]);

  function refreshQuotes() {
    if (lead) getQuotesForLeadAction(lead.id).then(setQuotes);
  }

  if (!lead) return null;
  const stage = stageColorClasses(lead.stage.color);

  function handleSave() {
    if (!lead) return;
    setError(null);
    startTransition(async () => {
      const result = await updateLeadAction(lead.id, patch);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleLogNote() {
    if (!lead || !note.trim()) return;
    startTransition(async () => {
      const result = await logLeadActivityAction(lead.id, note);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setNote("");
      getLeadEventsAction(lead.id).then(setEvents);
      router.refresh();
    });
  }

  return (
    <>
      <Sheet open={lead !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto bg-popover p-6 text-popover-foreground sm:max-w-md">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <SheetTitle>{lead.company_name}</SheetTitle>
              <span className={cn("rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide", stage.badge)}>{lead.stage.label}</span>
            </div>
            <SheetDescription>
              {[lead.strategy ? `Estratégia: ${lead.strategy.name}` : null, lead.list ? `Lista: ${lead.list.name}` : null].filter(Boolean).join(" · ") || "Sem estratégia/lista de origem"}
            </SheetDescription>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="lead-contact">Contato</Label>
              <Input id="lead-contact" value={patch.contactName ?? ""} onChange={(e) => setPatch((p) => ({ ...p, contactName: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lead-role">Cargo</Label>
              <Input id="lead-role" value={patch.roleTitle ?? ""} onChange={(e) => setPatch((p) => ({ ...p, roleTitle: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lead-whatsapp">WhatsApp</Label>
              <Input id="lead-whatsapp" value={patch.whatsapp ?? ""} onChange={(e) => setPatch((p) => ({ ...p, whatsapp: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lead-email">E-mail</Label>
              <Input id="lead-email" type="email" value={patch.email ?? ""} onChange={(e) => setPatch((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lead-value">Valor potencial (R$)</Label>
              <Input
                id="lead-value"
                type="number"
                inputMode="decimal"
                value={patch.potentialValue ?? ""}
                onChange={(e) => setPatch((p) => ({ ...p, potentialValue: e.target.value.trim() === "" ? null : Number(e.target.value) }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lead-owner">Responsável</Label>
              <select
                id="lead-owner"
                value={patch.ownerId ?? ""}
                onChange={(e) => setPatch((p) => ({ ...p, ownerId: e.target.value || null }))}
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value="">—</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="lead-next-contact">Próximo contato</Label>
              <Input
                id="lead-next-contact"
                type="datetime-local"
                value={patch.nextContactAt ? patch.nextContactAt.slice(0, 16) : ""}
                onChange={(e) => setPatch((p) => ({ ...p, nextContactAt: e.target.value ? new Date(e.target.value).toISOString() : null }))}
              />
            </div>
            {/* CNPJ/CPF + Cidade/Estado — usados pelo onboarding quando o negócio fecha (evita
             *  perguntar de novo o que já foi preenchido aqui). */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="lead-cnpj">CNPJ/CPF</Label>
              <Input id="lead-cnpj" value={patch.cnpjCpf ?? ""} onChange={(e) => setPatch((p) => ({ ...p, cnpjCpf: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="lead-city">Cidade</Label>
                <Input id="lead-city" value={patch.city ?? ""} onChange={(e) => setPatch((p) => ({ ...p, city: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="lead-state">UF</Label>
                <Input id="lead-state" maxLength={2} value={patch.state ?? ""} onChange={(e) => setPatch((p) => ({ ...p, state: e.target.value.toUpperCase() }))} />
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="lead-notes">Observações</Label>
              <textarea
                id="lead-notes"
                value={patch.notes ?? ""}
                onChange={(e) => setPatch((p) => ({ ...p, notes: e.target.value }))}
                rows={2}
                className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="button" onClick={handleSave} disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar alterações"}
          </Button>

          <div className="flex flex-col gap-3 border-t border-border/60 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Orçamentos</p>
              <Button type="button" variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={() => setQuoteBuilderOpen(true)}>
                <Plus className="size-3" />
                Novo
              </Button>
            </div>
            {quotes.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhum orçamento criado ainda.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {quotes.map((quote) => (
                  <div key={quote.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 px-3 py-2 text-xs">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{quote.title}</span>
                      <span className="text-muted-foreground">
                        {quote.items.length} ite{quote.items.length === 1 ? "m" : "ns"} · {currencyFormatter.format(quote.total)}
                      </span>
                    </div>
                    <StatusDot tone={QUOTE_STATUS_TONE[quote.status]} label={QUOTE_STATUS_LABEL[quote.status]} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-border/60 pt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Histórico</p>
            <div className="flex gap-2">
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Registrar contato/observação..." />
              <Button type="button" variant="outline" onClick={handleLogNote} disabled={isPending || !note.trim()}>
                Registrar
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              {events.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nenhum evento registrado ainda.</p>
              ) : (
                events.map((event) => (
                  <div key={event.id} className="flex flex-col gap-0.5 text-xs">
                    <span className="text-muted-foreground">{dateTimeFormatter.format(new Date(event.created_at))}</span>
                    <span>{describeEvent(event)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </SheetContent>
      </Sheet>

      <QuoteBuilderDialog
        leadId={lead.id}
        open={quoteBuilderOpen}
        onOpenChange={(open) => {
          setQuoteBuilderOpen(open);
          if (!open) refreshQuotes();
        }}
      />
    </>
  );
}

function describeEvent(event: Event): string {
  const metadata = event.metadata as Record<string, unknown>;
  switch (event.type) {
    case "stage_changed":
      return `Movido de "${metadata.from ?? "—"}" para "${metadata.to ?? "—"}"`;
    case "note_added":
      return String(metadata.message ?? "");
    case "lead_converted":
      return "Convertido em cliente";
    default:
      return event.type;
  }
}
