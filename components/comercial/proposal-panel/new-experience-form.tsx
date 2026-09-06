"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProposalFromTemplateAction } from "@/lib/comercial/proposal-actions";
import { cn } from "@/lib/utils";
import type { LeadWithRelations } from "@/lib/comercial/types";
import type { ProposalTemplate, ProposalType } from "@/lib/supabase/types/database";

const TYPE_OPTIONS: { value: ProposalType; label: string; description: string }[] = [
  { value: "prospecting", label: "Projeto", description: "Página de prospecção" },
  { value: "presentation", label: "Proposta", description: "Proposta de venda" },
];

/**
 * Hub de Projetos/Propostas (pedido explícito: "Projetos são pages de prospecção, Propostas são
 * as propostas de venda") — um formulário só, tipo escolhido primeiro (`type`, brief "Procreating
 * Experiences") decide qual template filtrar. Lead do CRM opcional — reaproveita
 * `createProposalFromTemplateAction` (já aceitava `leadId`, só não tinha UI de escolher qual);
 * sem lead selecionado, cai no mesmo fluxo de nome livre de sempre (proposta avulsa, tipo
 * Pascoal).
 */
export function NewExperienceForm({ templates, leads }: { templates: ProposalTemplate[]; leads: LeadWithRelations[] }) {
  const router = useRouter();
  const [type, setType] = useState<ProposalType>("presentation");
  const [leadId, setLeadId] = useState("");
  const [manualName, setManualName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const templatesForType = useMemo(() => templates.filter((t) => t.type === type), [templates, type]);
  const template = templatesForType[0];
  const selectedLead = leads.find((l) => l.id === leadId) ?? null;
  const ownerName = selectedLead?.company_name ?? manualName.trim();

  function handleCreate() {
    if (!template) {
      setError(`Nenhum template de ${TYPE_OPTIONS.find((o) => o.value === type)?.label} cadastrado ainda.`);
      return;
    }
    if (!ownerName) {
      setError("Escolha um lead ou digite um nome.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createProposalFromTemplateAction({
        leadId: leadId || null,
        clientId: null,
        templateId: template.id,
        title: `${type === "prospecting" ? "Projeto" : "Proposta"} para ${ownerName}`,
        ownerName,
        brandName: ownerName,
      });
      if (!result.ok || !result.proposalId) {
        setError(result.ok ? "Não foi possível criar." : result.error);
        return;
      }
      router.push(`/comercial/propostas/${result.proposalId}`);
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card/40 p-5">
      <div className="flex flex-col gap-2">
        <Label>Tipo</Label>
        <div className="flex gap-2">
          {TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setType(option.value)}
              className={cn(
                "flex-1 rounded-md border px-3 py-2 text-left text-sm transition-colors",
                type === option.value ? "border-foreground/30 bg-foreground/[0.06] text-foreground" : "border-input text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="block font-medium">{option.label}</span>
              <span className="block text-xs text-muted-foreground">{option.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="experience-lead">Lead do CRM</Label>
        <select
          id="experience-lead"
          value={leadId}
          onChange={(e) => setLeadId(e.target.value)}
          className="h-9 rounded-md border border-input bg-input-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <option value="">Sem lead — nome manual</option>
          {leads.map((lead) => (
            <option key={lead.id} value={lead.id}>
              {lead.company_name}
            </option>
          ))}
        </select>
      </div>

      {!leadId && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="experience-name">Nome (sem lead vinculado)</Label>
          <Input
            id="experience-name"
            value={manualName}
            onChange={(e) => setManualName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="Ex.: Maria Souza"
            autoFocus
          />
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Cria a partir de &ldquo;{template?.title ?? "—"}&rdquo; e leva direto pro editor — o link público só fica ativo depois de enviar.
      </p>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="button" onClick={handleCreate} disabled={isPending} className="w-fit">
        {isPending ? "Criando..." : `Criar ${TYPE_OPTIONS.find((o) => o.value === type)?.label}`}
      </Button>
    </div>
  );
}
