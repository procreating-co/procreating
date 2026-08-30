"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusDot, type StatusTone } from "@/components/dashboard/status-dot";
import { SectionEditorCard } from "@/components/comercial/proposal-editor/section-editor-card";
import { ConvertProposalDialog } from "@/components/comercial/proposal-editor/convert-proposal-dialog";
import {
  addProposalSectionAction,
  duplicateProposalSectionAction,
  removeProposalSectionAction,
  reorderProposalSectionAction,
  sendProposalAction,
  toggleProposalSectionVisibilityAction,
  updateProposalSectionAction,
  updateProposalStatusAction,
  updateProposalTitleAction,
} from "@/lib/comercial/proposal-actions";
import { SECTION_TYPE_LABEL } from "@/lib/comercial/proposal-content-types";
import { computePositionBetween } from "@/lib/tasks/position";
import type { ProposalSection, ProposalSectionType, ProposalStatus, ProposalVersion } from "@/lib/supabase/types/database";
import type { ProposalWithSections } from "@/lib/comercial/proposal-queries";

const STATUS_LABEL: Record<ProposalStatus, string> = {
  draft: "Rascunho",
  sent: "Enviada",
  negotiating: "Em negociação",
  revision_requested: "Revisão pedida",
  accepted: "Aceita",
  rejected: "Recusada",
  expired: "Expirada",
  archived: "Arquivada",
  cancelled: "Cancelada",
};
const STATUS_TONE: Record<ProposalStatus, StatusTone> = {
  draft: "neutral",
  sent: "pending",
  negotiating: "pending",
  revision_requested: "pending",
  accepted: "active",
  rejected: "danger",
  expired: "danger",
  archived: "neutral",
  cancelled: "danger",
};

/** Editor completo (§24/§8 do plano) — Admin UI, design do Procreating OS. Título + status +
 *  link público (quando existe) no topo; seções abaixo, cada uma um `SectionEditorCard`. */
export function ProposalEditor({ proposal, ownerName, versions }: { proposal: ProposalWithSections; ownerName: string | null; versions: ProposalVersion[] }) {
  const router = useRouter();
  const [title, setTitle] = useState(proposal.title);
  const [sections, setSections] = useState(proposal.sections);
  const [error, setError] = useState<string | null>(null);
  const [convertOpen, setConvertOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const publicUrl = proposal.status !== "draft" ? `/propostas/${proposal.slug}` : null;

  function persistSections(next: ProposalSection[]) {
    setSections(next);
  }

  function updateSectionContent(sectionId: string, content: Record<string, unknown>) {
    persistSections(sections.map((s) => (s.id === sectionId ? { ...s, content } : s)));
    startTransition(async () => {
      await updateProposalSectionAction(sectionId, content);
    });
  }

  function moveSection(sectionId: string, direction: "up" | "down") {
    const sorted = [...sections].sort((a, b) => a.position - b.position);
    const index = sorted.findIndex((s) => s.id === sectionId);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const reordered = [...sorted];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    const insertAt = reordered.findIndex((s) => s.id === sectionId);
    const before = reordered[insertAt - 1]?.position ?? null;
    const after = reordered[insertAt + 1]?.position ?? null;
    const newPosition = computePositionBetween(before, after);

    persistSections(sections.map((s) => (s.id === sectionId ? { ...s, position: newPosition } : s)));
    startTransition(async () => {
      await reorderProposalSectionAction(sectionId, newPosition);
      router.refresh();
    });
  }

  function toggleVisible(sectionId: string, visible: boolean) {
    persistSections(sections.map((s) => (s.id === sectionId ? { ...s, visible: !visible } : s)));
    startTransition(async () => {
      await toggleProposalSectionVisibilityAction(sectionId, !visible);
    });
  }

  function duplicateSection(sectionId: string) {
    startTransition(async () => {
      await duplicateProposalSectionAction(sectionId);
      router.refresh();
    });
  }

  function removeSection(sectionId: string) {
    persistSections(sections.filter((s) => s.id !== sectionId));
    startTransition(async () => {
      await removeProposalSectionAction(sectionId);
    });
  }

  function addSection(sectionType: ProposalSectionType) {
    startTransition(async () => {
      await addProposalSectionAction(proposal.id, sectionType);
      router.refresh();
    });
  }

  function saveTitle() {
    startTransition(async () => {
      await updateProposalTitleAction(proposal.id, title);
    });
  }

  function send() {
    setError(null);
    startTransition(async () => {
      const result = await sendProposalAction(proposal.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function setStatus(status: "negotiating" | "revision_requested" | "archived" | "cancelled") {
    startTransition(async () => {
      await updateProposalStatusAction(proposal.id, status);
      router.refresh();
    });
  }

  const sortedSections = [...sections].sort((a, b) => a.position - b.position);
  const missingSectionTypes = (Object.keys(SECTION_TYPE_LABEL) as ProposalSectionType[]).filter((type) => !sections.some((s) => s.section_type === type));

  return (
    <div className="flex flex-col gap-6">
      <Link href="/comercial" className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-3.5" />
        Comercial
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={saveTitle} className="h-auto border-none px-0 font-display text-2xl shadow-none focus-visible:ring-0" />
          {ownerName && <p className="text-sm text-muted-foreground">Para {ownerName}</p>}
        </div>
        <div className="flex items-center gap-2">
          <StatusDot tone={STATUS_TONE[proposal.status]} label={STATUS_LABEL[proposal.status]} />
          {publicUrl && (
            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-neutral-900 transition-colors hover:bg-neutral-200">
              Ver pública <ArrowUpRight className="size-3" />
            </a>
          )}
        </div>
      </div>

      {proposal.view_count > 0 && (
        <p className="text-xs text-muted-foreground">
          Vista {proposal.view_count}x{proposal.last_viewed_at && ` · última vez ${new Date(proposal.last_viewed_at).toLocaleString("pt-BR")}`}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={send} disabled={isPending || proposal.status === "accepted"}>
          {proposal.status === "draft" ? "Enviar" : "Enviar nova versão"}
        </Button>
        {proposal.status === "sent" && (
          <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={() => setStatus("negotiating")}>
            Marcar em negociação
          </Button>
        )}
        {(proposal.status === "sent" || proposal.status === "negotiating") && (
          <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={() => setStatus("revision_requested")}>
            Pedir revisão
          </Button>
        )}
        {proposal.status !== "accepted" && proposal.status !== "archived" && (
          <Button type="button" variant="ghost" size="sm" disabled={isPending} onClick={() => setStatus("archived")}>
            Arquivar
          </Button>
        )}
        {proposal.status === "accepted" && (
          <Button type="button" variant="outline" onClick={() => setConvertOpen(true)}>
            Converter em cliente
          </Button>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {sortedSections.map((section, index) => (
          <SectionEditorCard
            key={section.id}
            section={section}
            isFirst={index === 0}
            isLast={index === sortedSections.length - 1}
            onChange={(content) => updateSectionContent(section.id, content)}
            onMove={(direction) => moveSection(section.id, direction)}
            onToggleVisible={() => toggleVisible(section.id, section.visible)}
            onDuplicate={() => duplicateSection(section.id)}
            onRemove={() => removeSection(section.id)}
          />
        ))}
      </div>

      {missingSectionTypes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {missingSectionTypes.map((type) => (
            <Button key={type} type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => addSection(type)}>
              <Plus className="size-3.5" />
              {SECTION_TYPE_LABEL[type]}
            </Button>
          ))}
        </div>
      )}

      {versions.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-border/60 pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Versões enviadas</p>
          <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
            {versions.map((version) => (
              <li key={version.id}>
                v{version.version_number} — {new Date(version.sent_at).toLocaleString("pt-BR")}
                {proposal.accepted_version_id === version.id && " · aceita"}
              </li>
            ))}
          </ul>
        </div>
      )}

      <ConvertProposalDialog proposalId={proposal.id} leadId={proposal.lead_id} open={convertOpen} onOpenChange={setConvertOpen} />
    </div>
  );
}
