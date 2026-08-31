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
import { LeadProposalsSection } from "@/components/comercial/lead-proposals-section";
import { getLeadEventsAction, logLeadActivityAction, moveLeadStageAction, updateLeadAction } from "@/lib/comercial/actions";
import { getQuotesForLeadAction } from "@/lib/comercial/quote-actions";
import { listProposalsForLeadAction } from "@/lib/comercial/proposal-actions";
import { stageColorClasses } from "@/lib/comercial/stage-colors";
import type { Event, PipelineStage, Proposal, QuoteStatus, User } from "@/lib/supabase/types/database";
import type { QuoteWithItems } from "@/lib/comercial/quotes";
import type { LeadPatch, LeadWithRelations } from "@/lib/comercial/types";
import { cn } from "@/lib/utils";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

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
export function LeadDetailDrawer({
  lead,
  users,
  stages,
  onOpenChange,
}: {
  lead: LeadWithRelations | null;
  users: User[];
  stages: PipelineStage[];
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [patch, setPatch] = useState<LeadPatch>({});
  const [note, setNote] = useState("");
  const [isPositiveResponse, setIsPositiveResponse] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [quotes, setQuotes] = useState<QuoteWithItems[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [quoteBuilderOpen, setQuoteBuilderOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!lead) return;
    setPatch(toPatch(lead));
    setError(null);
    setNote("");
    setIsPositiveResponse(false);
    setEvents([]);
    setQuotes([]);
    setProposals([]);
    getLeadEventsAction(lead.id).then(setEvents);
    getQuotesForLeadAction(lead.id).then(setQuotes);
    listProposalsForLeadAction(lead.id).then(setProposals);
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
      const result = await logLeadActivityAction(lead.id, note, isPositiveResponse);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setNote("");
      setIsPositiveResponse(false);
      getLeadEventsAction(lead.id).then(setEvents);
      router.refresh();
    });
  }

  // Response Handling (§19) — 4 ações rápidas depois de uma resposta. "Continuar" só registra
  // nota, nenhuma mudança de estágio (é o "sem novidade" — a Automação §72 regra 1 já cobre
  // "isto foi uma resposta positiva, mover sozinho" via checkbox acima, não duplicado aqui).
  // "Agendar reunião"/"Desqualificar" reaproveitam moveLeadStageAction, a MESMA action do
  // drag-and-drop do Kanban — nenhuma lógica de troca de estágio nova. Fora daqui de propósito:
  // "Mover pro pipeline" (o 4º botão do prompt original) não tem estado distinto pra mover PRA
  // neste schema — todo lead já nasce dentro do pipeline (estágio "lead" em diante), não existe
  // um "fora do pipeline" aqui pra sair de.
  function handleQuickAction(kind: "continue" | "meeting" | "disqualify") {
    if (!lead) return;
    setError(null);
    startTransition(async () => {
      if (kind === "continue") {
        const result = await logLeadActivityAction(lead.id, "Sem novidade — segue no mesmo estágio.", false);
        if (!result.ok) {
          setError(result.error);
          return;
        }
      } else {
        const targetKey = kind === "meeting" ? "reuniao_agendada" : "perdido";
        const targetStage = stages.find((s) => s.key === targetKey);
        if (!targetStage) {
          setError(`Estágio "${targetKey}" não encontrado.`);
          return;
        }
        const result = await moveLeadStageAction(lead.id, targetStage.id);
        if (!result.ok) {
          setError(result.error);
          return;
        }
      }
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

          <LeadProposalsSection leadId={lead.id} ownerName={lead.company_name || lead.contact_name || "Lead"} proposals={proposals} />

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
            {/* Automação §72 regra 1 — marcar aqui move o lead pra "Respondeu" sozinho (só se
             *  ele ainda não tiver passado desse estágio), reaproveitando a mesma ação do
             *  Kanban. Nunca classificação por IA — é o humano dizendo "isto foi uma resposta". */}
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={isPositiveResponse}
                onChange={(e) => setIsPositiveResponse(e.target.checked)}
                className="size-3.5 rounded border-input"
              />
              Foi uma resposta do lead — mover pra &ldquo;Respondeu&rdquo; automaticamente
            </label>

            {!lead.stage.is_won && !lead.stage.is_lost && (
              <div className="flex flex-col gap-1.5">
                <p className="text-[11px] text-muted-foreground">Próxima ação:</p>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs" disabled={isPending} onClick={() => handleQuickAction("continue")}>
                    Continuar
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs" disabled={isPending} onClick={() => handleQuickAction("meeting")}>
                    Agendar reunião
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs text-destructive hover:text-destructive" disabled={isPending} onClick={() => handleQuickAction("disqualify")}>
                    Desqualificar
                  </Button>
                </div>
              </div>
            )}

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
