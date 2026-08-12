"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Check, Copy, Instagram, MessageCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StageBadge } from "@/components/prospeccao/stage-badge";
import { IcpBadge } from "@/components/prospeccao/icp-badge";
import { useOficinas } from "@/components/prospeccao/oficinas-store";
import { STAGE_OPTIONS } from "@/lib/prospeccao/stages";
import { ICP_OPTIONS } from "@/lib/prospeccao/icp";
import { buildProspeccaoMessage } from "@/lib/prospeccao/mock-data";
import { buildWhatsAppUrl, normalizeInstagram, resolveWhatsAppNumber } from "@/lib/prospeccao/template";
import type { AderenciaIcp, Oficina, OficinaStage } from "@/lib/prospeccao/types";

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

/**
 * Estado + ações da ficha de um lead — extraído do drawer/modal pra ser reaproveitado pelas
 * duas apresentações (lateral, na Gestão; página inteira, em Oficinas) sem duplicar lógica.
 */
export function useLeadFicha(oficina: Oficina | null) {
  const { patchOficina, removeOficina, logOficinaEvent } = useOficinas();

  const [responsavel, setResponsavel] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
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
    setInstagram(oficina.instagram);
    setStatus(oficina.status);
    setAderenciaIcp(oficina.aderenciaIcp);
    setObservacoes(oficina.observacoes);
    setNextFollowUpAt(toDateInputValue(oficina.nextFollowUpAt));
  }, [oficina?.id]);

  const dirty = Boolean(
    oficina &&
      (responsavel !== oficina.responsavel ||
        whatsapp !== oficina.whatsapp ||
        instagram !== oficina.instagram ||
        status !== oficina.status ||
        aderenciaIcp !== oficina.aderenciaIcp ||
        observacoes !== oficina.observacoes ||
        nextFollowUpAt !== toDateInputValue(oficina.nextFollowUpAt)),
  );

  function handleSave() {
    if (!oficina) return;
    patchOficina(oficina.id, {
      responsavel,
      whatsapp,
      instagram: normalizeInstagram(instagram),
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

  return {
    responsavel,
    setResponsavel,
    whatsapp,
    setWhatsapp,
    instagram,
    setInstagram,
    status,
    setStatus,
    aderenciaIcp,
    setAderenciaIcp,
    observacoes,
    setObservacoes,
    nextFollowUpAt,
    setNextFollowUpAt,
    copied,
    dirty,
    deleting,
    setDeleting,
    handleSave,
    handleCopyMessage,
    logFollowUp: () => oficina && logOficinaEvent(oficina.id, "Follow-up realizado", true),
    remove: () => oficina && removeOficina(oficina.id),
  };
}

export type LeadFicha = ReturnType<typeof useLeadFicha>;

/**
 * Corpo da ficha de CRM — mesmo conteúdo por trás do drawer lateral (Gestão) e do modal em
 * página inteira (Oficinas). Só a moldura muda entre um e outro.
 */
export function LeadFichaBody({ oficina, ficha, onDeleted }: { oficina: Oficina; ficha: LeadFicha; onDeleted: () => void }) {
  return (
    <>
      <div className="flex flex-col gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-xl text-white sm:text-2xl">{oficina.nome}</h2>
            <StageBadge status={oficina.status} />
            <IcpBadge value={oficina.aderenciaIcp} />
          </div>
          <p className="mt-1 text-sm text-white/50">
            {[oficina.cidade, oficina.bairro].filter(Boolean).join(" · ") || "Cidade/bairro não informados"}
            {oficina.endereco ? ` — ${oficina.endereco}` : ""}
          </p>
        </div>

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
          <Button type="button" size="sm" variant="outline" className="gap-2 border-white/15 bg-transparent text-white hover:bg-white/10" onClick={ficha.handleCopyMessage}>
            {ficha.copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
            {ficha.copied ? "Copiado" : "Copiar mensagem"}
          </Button>
          {oficina.instagram && (
            <Button asChild size="sm" variant="outline" className="gap-2 border-white/15 bg-transparent text-white hover:bg-white/10">
              <a href={oficina.instagram} target="_blank" rel="noopener noreferrer">
                <Instagram className="size-4" />
                Abrir Instagram
              </a>
            </Button>
          )}
          <Button type="button" size="sm" variant="outline" className="gap-2 border-white/15 bg-transparent text-white hover:bg-white/10" onClick={ficha.logFollowUp}>
            <CalendarClock className="size-4" />
            Registrar follow-up
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-lg border border-white/10 bg-white/[0.02] p-4 font-mono text-xs sm:max-w-sm">
          <div>
            <span className="text-white/40">Data de cadastro</span>
            <p className="mt-1 text-white">{formatDate(oficina.createdAt)}</p>
          </div>
          <div>
            <span className="text-white/40">Último contato</span>
            <p className="mt-1 text-white">{formatDate(oficina.lastContactAt)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="lead-responsavel">Responsável</Label>
            <Input
              id="lead-responsavel"
              value={ficha.responsavel}
              onChange={(e) => ficha.setResponsavel(e.target.value)}
              placeholder="Sem responsável identificado"
              className="border-white/15 bg-white/[0.03] text-white"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="lead-whatsapp">Celular</Label>
            <Input id="lead-whatsapp" value={ficha.whatsapp} onChange={(e) => ficha.setWhatsapp(e.target.value)} className="border-white/15 bg-white/[0.03] text-white" />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="lead-instagram">Instagram</Label>
            <Input
              id="lead-instagram"
              value={ficha.instagram}
              onChange={(e) => ficha.setInstagram(e.target.value)}
              placeholder="@perfil ou link"
              className="border-white/15 bg-white/[0.03] text-white"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="lead-status">Status</Label>
            <select
              id="lead-status"
              value={ficha.status}
              onChange={(e) => ficha.setStatus(e.target.value as OficinaStage)}
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
              value={ficha.aderenciaIcp}
              onChange={(e) => ficha.setAderenciaIcp(e.target.value as AderenciaIcp)}
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
            <Input id="lead-followup" type="date" value={ficha.nextFollowUpAt} onChange={(e) => ficha.setNextFollowUpAt(e.target.value)} className="border-white/15 bg-white/[0.03] text-white" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="lead-observacoes">Observações</Label>
          <textarea
            id="lead-observacoes"
            value={ficha.observacoes}
            onChange={(e) => ficha.setObservacoes(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-md border border-white/15 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus-visible:border-[var(--client-accent)]"
          />
        </div>

        <Button type="button" disabled={!ficha.dirty} onClick={ficha.handleSave} className="self-start bg-[var(--client-accent)] text-black hover:opacity-90 disabled:opacity-40">
          Salvar alterações
        </Button>

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
          className="gap-2 self-start text-red-400 hover:bg-red-500/10 hover:text-red-300"
          onClick={() => ficha.setDeleting(true)}
        >
          <Trash2 className="size-4" />
          Excluir oficina
        </Button>
      </div>

      <Dialog open={ficha.deleting} onOpenChange={ficha.setDeleting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir oficina?</DialogTitle>
            <DialogDescription>{`"${oficina.nome}" será removida da lista de prospecção. Essa ação não pode ser desfeita.`}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => ficha.setDeleting(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                ficha.remove();
                ficha.setDeleting(false);
                onDeleted();
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
