"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Check, Copy, MessageCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SideDrawer, SideDrawerContent, SideDrawerDescription, SideDrawerHeader, SideDrawerTitle } from "@/components/prospeccao/side-drawer";
import { StageBadge } from "@/components/prospeccao/stage-badge";
import { IcpBadge } from "@/components/prospeccao/icp-badge";
import { useOficinas } from "@/components/prospeccao/oficinas-store";
import { STAGE_OPTIONS } from "@/lib/prospeccao/stages";
import { ICP_OPTIONS } from "@/lib/prospeccao/icp";
import { buildProspeccaoMessage } from "@/lib/prospeccao/mock-data";
import { buildWhatsAppUrl, resolveWhatsAppNumber } from "@/lib/prospeccao/template";
import type { AderenciaIcp, OficinaStage } from "@/lib/prospeccao/types";

function formatDate(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/** Converte um ISO em `yyyy-mm-dd` pra alimentar um `<input type="date">`. */
function toDateInputValue(iso: string | null) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export type LeadDetailDrawerProps = {
  oficinaId: string | null;
  onOpenChange: (open: boolean) => void;
};

/**
 * Ficha de CRM de um lead — usada tanto pela tabela de Oficinas quanto pelo Kanban de Gestão,
 * lendo e escrevendo no MESMO registro via `useOficinas()`. Fechar e reabrir não perde nada:
 * o estado vem sempre do store, o drawer só espelha.
 */
export function LeadDetailDrawer({ oficinaId, onOpenChange }: LeadDetailDrawerProps) {
  const { oficinas, patchOficina, removeOficina, logOficinaEvent } = useOficinas();
  const oficina = oficinas.find((o) => o.id === oficinaId) ?? null;

  const [responsavel, setResponsavel] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [status, setStatus] = useState<OficinaStage>("contato");
  const [aderenciaIcp, setAderenciaIcp] = useState<AderenciaIcp>("nao_classificado");
  const [observacoes, setObservacoes] = useState("");
  const [nextFollowUpAt, setNextFollowUpAt] = useState("");
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!oficina) return;
    setResponsavel(oficina.responsavel);
    setWhatsapp(oficina.whatsapp);
    setStatus(oficina.status);
    setAderenciaIcp(oficina.aderenciaIcp);
    setObservacoes(oficina.observacoes);
    setNextFollowUpAt(toDateInputValue(oficina.nextFollowUpAt));
  }, [oficina?.id]);

  if (!oficina) return null;

  const dirty =
    responsavel !== oficina.responsavel ||
    whatsapp !== oficina.whatsapp ||
    status !== oficina.status ||
    aderenciaIcp !== oficina.aderenciaIcp ||
    observacoes !== oficina.observacoes ||
    nextFollowUpAt !== toDateInputValue(oficina.nextFollowUpAt);

  function handleSave() {
    if (!oficina) return;
    patchOficina(oficina.id, {
      responsavel,
      whatsapp,
      status,
      aderenciaIcp,
      observacoes,
      nextFollowUpAt: nextFollowUpAt ? new Date(`${nextFollowUpAt}T09:00:00-03:00`).toISOString() : null,
    });
  }

  async function handleCopyMessage() {
    if (!oficina) return;
    await navigator.clipboard.writeText(buildProspeccaoMessage(oficina));
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <>
      <SideDrawer open={oficina !== null} onOpenChange={onOpenChange}>
        <SideDrawerContent>
          <SideDrawerHeader>
            <div className="flex flex-wrap items-center gap-2">
              <SideDrawerTitle>{oficina.nome}</SideDrawerTitle>
              <StageBadge status={oficina.status} />
              <IcpBadge value={oficina.aderenciaIcp} />
            </div>
            <SideDrawerDescription>
              {[oficina.cidade, oficina.bairro].filter(Boolean).join(" · ") || "Cidade/bairro não informados"}
              {oficina.endereco ? ` — ${oficina.endereco}` : ""}
            </SideDrawerDescription>
          </SideDrawerHeader>

          {(oficina.segmento || oficina.fonte) && (
            <div className="flex flex-col gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs text-white/50">
              {oficina.segmento && <p>{oficina.segmento}</p>}
              <p className="font-mono text-[11px] uppercase tracking-wide text-white/30">Fonte: {oficina.fonte}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" className="gap-2 bg-[var(--client-accent)] text-black hover:opacity-90">
              <a href={buildWhatsAppUrl(resolveWhatsAppNumber(oficina), buildProspeccaoMessage(oficina))} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-4" />
                Abrir WhatsApp
              </a>
            </Button>
            <Button type="button" size="sm" variant="outline" className="gap-2 border-white/15 bg-transparent text-white hover:bg-white/10" onClick={handleCopyMessage}>
              {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
              {copied ? "Copiado" : "Copiar mensagem"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-2 border-white/15 bg-transparent text-white hover:bg-white/10"
              onClick={() => logOficinaEvent(oficina.id, "Follow-up realizado", true)}
            >
              <CalendarClock className="size-4" />
              Registrar follow-up
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-lg border border-white/10 bg-white/[0.02] p-4 font-mono text-xs">
            <div>
              <span className="text-white/40">Data de cadastro</span>
              <p className="mt-1 text-white">{formatDate(oficina.createdAt)}</p>
            </div>
            <div>
              <span className="text-white/40">Último contato</span>
              <p className="mt-1 text-white">{formatDate(oficina.lastContactAt)}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="lead-responsavel">Responsável</Label>
              <Input id="lead-responsavel" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} placeholder="Sem responsável identificado" className="border-white/15 bg-white/[0.03] text-white" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="lead-whatsapp">Celular</Label>
              <Input id="lead-whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="border-white/15 bg-white/[0.03] text-white" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="lead-status">Status</Label>
              <select
                id="lead-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as OficinaStage)}
                className="h-9 rounded-md border border-white/15 bg-white/[0.03] px-3 text-sm text-white outline-none focus-visible:border-[var(--client-accent)]"
              >
                {STAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} className="bg-[#0c0c0c]">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="lead-icp">Aderência ICP</Label>
              <select
                id="lead-icp"
                value={aderenciaIcp}
                onChange={(e) => setAderenciaIcp(e.target.value as AderenciaIcp)}
                className="h-9 rounded-md border border-white/15 bg-white/[0.03] px-3 text-sm text-white outline-none focus-visible:border-[var(--client-accent)]"
              >
                {ICP_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} className="bg-[#0c0c0c]">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="lead-followup">Próximo follow-up</Label>
              <Input id="lead-followup" type="date" value={nextFollowUpAt} onChange={(e) => setNextFollowUpAt(e.target.value)} className="border-white/15 bg-white/[0.03] text-white" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="lead-observacoes">Observações</Label>
              <textarea
                id="lead-observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-md border border-white/15 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus-visible:border-[var(--client-accent)]"
              />
            </div>

            <Button type="button" disabled={!dirty} onClick={handleSave} className="bg-[var(--client-accent)] text-black hover:opacity-90 disabled:opacity-40">
              Salvar alterações
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-mono text-[11px] uppercase tracking-wide text-white/40">Histórico de interações</span>
            <ol className="flex flex-col gap-3 border-l border-white/10 pl-4">
              {[...oficina.history].reverse().map((entry) => (
                <li key={entry.id} className="relative text-sm">
                  <span className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-[var(--client-accent)]" />
                  <p className="text-white/80">{entry.message}</p>
                  <p className="font-mono text-[11px] text-white/35">{formatDateTime(entry.at)}</p>
                </li>
              ))}
            </ol>
          </div>

          <Button
            type="button"
            variant="ghost"
            className="mt-auto gap-2 self-start text-red-400 hover:bg-red-500/10 hover:text-red-300"
            onClick={() => setDeleting(true)}
          >
            <Trash2 className="size-4" />
            Excluir oficina
          </Button>
        </SideDrawerContent>
      </SideDrawer>

      <Dialog open={deleting} onOpenChange={setDeleting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir oficina?</DialogTitle>
            <DialogDescription>{`"${oficina.nome}" será removida da lista de prospecção. Essa ação não pode ser desfeita.`}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleting(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                removeOficina(oficina.id);
                setDeleting(false);
                onOpenChange(false);
              }}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
