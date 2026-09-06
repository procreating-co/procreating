"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreateNicheDialog } from "@/components/comercial/proposal-panel/create-niche-dialog";
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
 *
 * "Nicho" (pedido explícito, só pra Projeto — "criar pages para arquitetos, advogados, etc.") —
 * um molde (`proposal_template`) a mais do tipo `prospecting`; quando há mais de um, um seletor
 * aparece (mesma regra "só mostra escolha quando há mais de uma opção" já usada em
 * `quick-add-menu.tsx`). "Criar Nicho" abre `CreateNicheDialog`, que devolve o template novo já
 * pronto pra usar — mesclado localmente (`extraTemplates`) até o próximo `router.refresh()`
 * trazer ele de volta pelos props reais, pra nunca sumir da lista entre o clique e a resposta.
 */
export function NewExperienceForm({ templates, leads }: { templates: ProposalTemplate[]; leads: LeadWithRelations[] }) {
  const router = useRouter();
  const [type, setType] = useState<ProposalType>("presentation");
  const [extraTemplates, setExtraTemplates] = useState<ProposalTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [nicheDialogOpen, setNicheDialogOpen] = useState(false);
  const [leadId, setLeadId] = useState("");
  const [manualName, setManualName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const allTemplates = useMemo(() => {
    const merged = [...templates];
    for (const extra of extraTemplates) if (!merged.some((t) => t.id === extra.id)) merged.push(extra);
    return merged;
  }, [templates, extraTemplates]);

  const templatesForType = useMemo(() => allTemplates.filter((t) => t.type === type), [allTemplates, type]);
  const template = templatesForType.find((t) => t.id === selectedTemplateId) ?? templatesForType[0] ?? null;
  const baseTemplateForClone = templatesForType[0];

  const selectedLead = leads.find((l) => l.id === leadId) ?? null;
  const ownerName = selectedLead?.company_name ?? manualName.trim();

  function selectType(next: ProposalType) {
    setType(next);
    setSelectedTemplateId(null); // volta pro primeiro molde daquele tipo
  }

  function handleNicheCreated(newTemplate: ProposalTemplate) {
    setExtraTemplates((prev) => [...prev, newTemplate]);
    setSelectedTemplateId(newTemplate.id);
    router.refresh();
  }

  function handleCreate() {
    if (!template) {
      setError(`Nenhum molde de ${TYPE_OPTIONS.find((o) => o.value === type)?.label} cadastrado ainda.`);
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
              onClick={() => selectType(option.value)}
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

      {type === "prospecting" && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="experience-niche">Nicho</Label>
          <div className="flex gap-2">
            <select
              id="experience-niche"
              value={template?.id ?? ""}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              disabled={templatesForType.length === 0}
              className="h-9 flex-1 rounded-md border border-input bg-input-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {templatesForType.length === 0 ? (
                <option value="">Nenhum nicho ainda</option>
              ) : (
                templatesForType.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))
              )}
            </select>
            {baseTemplateForClone && (
              <Button type="button" variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={() => setNicheDialogOpen(true)}>
                <Plus className="size-3.5" />
                Criar nicho
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Cada nicho é um molde próprio (ex.: Arquitetos, Advogados) — mesma estrutura de partida, conteúdo escrito depois no editor.</p>
        </div>
      )}

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

      {baseTemplateForClone && (
        <CreateNicheDialog open={nicheDialogOpen} onOpenChange={setNicheDialogOpen} type={type} cloneFromTemplateId={baseTemplateForClone.id} onCreated={handleNicheCreated} />
      )}
    </div>
  );
}
