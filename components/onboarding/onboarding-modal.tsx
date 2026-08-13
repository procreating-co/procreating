"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { closeLeadAction } from "@/lib/onboarding/actions";
import { createInitialOnboardingData, type OnboardingWizardData } from "@/lib/onboarding/types";
import type { LeadWithRelations } from "@/lib/comercial/types";
import { cn } from "@/lib/utils";

const STEPS = ["Dados do cliente", "Contrato", "Escopo", "Estratégia", "Aprovação"];

const textareaClass =
  "w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";
const selectClass =
  "h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function OnboardingModal({
  lead,
  open,
  onOpenChange,
  onSuccess,
}: {
  lead: LeadWithRelations;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (clientId: string) => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<OnboardingWizardData>(() => createInitialOnboardingData(lead.company_name));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function update(patch: Partial<OnboardingWizardData>) {
    setData((current) => ({ ...current, ...patch }));
    setError(null);
  }

  function validateStep(index: number): string | null {
    if (index === 0 && !data.clientName.trim()) return "Informe o nome do cliente.";
    if (index === 1) {
      if (!data.startDate) return "Informe a data de início.";
      if (data.contractType === "recorrente" && !data.monthlyValue.trim()) return "Informe o valor mensal.";
      if (data.contractType === "pontual" && !data.totalValue.trim()) return "Informe o valor total.";
    }
    return null;
  }

  function goNext() {
    const validationError = validateStep(stepIndex);
    if (validationError) {
      setError(validationError);
      return;
    }
    setStepIndex((i) => Math.min(STEPS.length - 1, i + 1));
  }

  function goBack() {
    setError(null);
    setStepIndex((i) => Math.max(0, i - 1));
  }

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) {
      setStepIndex(0);
      setData(createInitialOnboardingData(lead.company_name));
      setError(null);
    }
    onOpenChange(nextOpen);
  }

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await closeLeadAction(lead.id, data);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      handleClose(false);
      onSuccess(result.clientId);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <div className="flex max-h-[85vh] flex-col gap-6 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Fechar negócio — {lead.company_name}</DialogTitle>
            <DialogDescription>
              {stepIndex + 1}. {STEPS[stepIndex]}
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-1.5">
            {STEPS.map((label, index) => (
              <div key={label} className={cn("h-1 flex-1 rounded-full", index <= stepIndex ? "bg-foreground" : "bg-border")} />
            ))}
          </div>

          {stepIndex === 0 && <StepClientData data={data} update={update} />}
          {stepIndex === 1 && <StepContract data={data} update={update} />}
          {stepIndex === 2 && <StepScope data={data} update={update} />}
          {stepIndex === 3 && <StepStrategy data={data} update={update} />}
          {stepIndex === 4 && <StepReview data={data} />}

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter className="justify-between">
            <Button type="button" variant="outline" onClick={goBack} disabled={stepIndex === 0}>
              Voltar
            </Button>
            {stepIndex === STEPS.length - 1 ? (
              <Button type="button" onClick={handleConfirm} disabled={isPending}>
                {isPending ? "Criando cliente..." : "Confirmar e criar cliente"}
              </Button>
            ) : (
              <Button type="button" onClick={goNext}>
                Avançar
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type StepProps = { data: OnboardingWizardData; update: (patch: Partial<OnboardingWizardData>) => void };

function StepClientData({ data, update }: StepProps) {
  function updateContact(index: number, patch: Partial<OnboardingWizardData["contacts"][number]>) {
    const contacts = data.contacts.map((contact, i) => (i === index ? { ...contact, ...patch } : contact));
    update({ contacts });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="ob-client-name">Nome do cliente</Label>
          <Input id="ob-client-name" value={data.clientName} onChange={(e) => update({ clientName: e.target.value })} required autoFocus />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ob-legal-name">Razão social</Label>
          <Input id="ob-legal-name" value={data.legalName} onChange={(e) => update({ legalName: e.target.value })} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ob-trade-name">Nome fantasia</Label>
          <Input id="ob-trade-name" value={data.tradeName} onChange={(e) => update({ tradeName: e.target.value })} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ob-cnpj">CNPJ</Label>
          <Input id="ob-cnpj" value={data.cnpj} onChange={(e) => update({ cnpj: e.target.value })} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ob-cpf">CPF</Label>
          <Input id="ob-cpf" value={data.cpf} onChange={(e) => update({ cpf: e.target.value })} />
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="ob-address">Endereço</Label>
          <Input id="ob-address" value={data.address} onChange={(e) => update({ address: e.target.value })} />
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="ob-billing">Dados de faturamento</Label>
          <textarea id="ob-billing" rows={2} value={data.billingInfo} onChange={(e) => update({ billingInfo: e.target.value })} className={textareaClass} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label>Responsáveis</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => update({ contacts: [...data.contacts, { name: "", roleTitle: "", email: "", whatsapp: "", isPrimary: false }] })}
          >
            <Plus className="size-3.5" />
            Adicionar
          </Button>
        </div>
        {data.contacts.map((contact, index) => (
          <div key={index} className="grid grid-cols-1 gap-2 rounded-md border border-border/60 p-3 sm:grid-cols-4">
            <Input placeholder="Nome" value={contact.name} onChange={(e) => updateContact(index, { name: e.target.value })} />
            <Input placeholder="Cargo" value={contact.roleTitle} onChange={(e) => updateContact(index, { roleTitle: e.target.value })} />
            <Input placeholder="E-mail" value={contact.email} onChange={(e) => updateContact(index, { email: e.target.value })} />
            <div className="flex items-center gap-2">
              <Input placeholder="WhatsApp" value={contact.whatsapp} onChange={(e) => updateContact(index, { whatsapp: e.target.value })} />
              {data.contacts.length > 1 && (
                <button type="button" onClick={() => update({ contacts: data.contacts.filter((_, i) => i !== index) })} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepContract({ data, update }: StepProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="ob-contract-type">Tipo de contrato</Label>
        <select id="ob-contract-type" value={data.contractType} onChange={(e) => update({ contractType: e.target.value as OnboardingWizardData["contractType"] })} className={selectClass}>
          <option value="recorrente">Recorrente</option>
          <option value="pontual">Pontual</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="ob-start">Data de início</Label>
          <Input id="ob-start" type="date" value={data.startDate} onChange={(e) => update({ startDate: e.target.value })} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ob-end">{data.contractType === "recorrente" ? "Data de término (se houver)" : "Data prevista de término"}</Label>
          <Input id="ob-end" type="date" value={data.endDate} onChange={(e) => update({ endDate: e.target.value })} />
        </div>

        {data.contractType === "recorrente" ? (
          <>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ob-monthly">Valor mensal (R$)</Label>
              <Input id="ob-monthly" type="number" inputMode="decimal" value={data.monthlyValue} onChange={(e) => update({ monthlyValue: e.target.value })} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ob-due-day">Dia de vencimento</Label>
              <Input id="ob-due-day" type="number" min={1} max={31} value={data.dueDay} onChange={(e) => update({ dueDay: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input type="checkbox" checked={data.autoRenew} onChange={(e) => update({ autoRenew: e.target.checked })} className="size-4 rounded border-input" />
              Renovação automática
            </label>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ob-total">Valor total (R$)</Label>
              <Input id="ob-total" type="number" inputMode="decimal" value={data.totalValue} onChange={(e) => update({ totalValue: e.target.value })} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ob-payment-terms">Condições de pagamento</Label>
              <Input id="ob-payment-terms" value={data.paymentTerms} onChange={(e) => update({ paymentTerms: e.target.value })} placeholder="50% entrada + 50% entrega" />
            </div>
          </>
        )}

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="ob-conditions">Condições especiais</Label>
          <textarea id="ob-conditions" rows={2} value={data.specialConditions} onChange={(e) => update({ specialConditions: e.target.value })} className={textareaClass} />
        </div>
      </div>
    </div>
  );
}

function StepScope({ data, update }: StepProps) {
  function updateItem(index: number, patch: Partial<OnboardingWizardData["scopeItems"][number]>) {
    update({ scopeItems: data.scopeItems.map((item, i) => (i === index ? { ...item, ...patch } : item)) });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Label>Itens de escopo</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => update({ scopeItems: [...data.scopeItems, { service: "", quantity: "", frequency: "", deadline: "", notes: "" }] })}
        >
          <Plus className="size-3.5" />
          Adicionar
        </Button>
      </div>
      {data.scopeItems.map((item, index) => (
        <div key={index} className="grid grid-cols-1 gap-2 rounded-md border border-border/60 p-3 sm:grid-cols-5">
          <Input placeholder="Serviço (vídeo, post...)" className="sm:col-span-2" value={item.service} onChange={(e) => updateItem(index, { service: e.target.value })} />
          <Input placeholder="Qtd" type="number" value={item.quantity} onChange={(e) => updateItem(index, { quantity: e.target.value })} />
          <Input placeholder="Frequência" value={item.frequency} onChange={(e) => updateItem(index, { frequency: e.target.value })} />
          <div className="flex items-center gap-2">
            <Input placeholder="Prazo" value={item.deadline} onChange={(e) => updateItem(index, { deadline: e.target.value })} />
            {data.scopeItems.length > 1 && (
              <button type="button" onClick={() => update({ scopeItems: data.scopeItems.filter((_, i) => i !== index) })} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function StepStrategy({ data, update }: StepProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label htmlFor="ob-objective">Objetivo do cliente</Label>
        <textarea id="ob-objective" rows={2} value={data.objective} onChange={(e) => update({ objective: e.target.value })} className={textareaClass} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="ob-audience">Público-alvo</Label>
        <Input id="ob-audience" value={data.targetAudience} onChange={(e) => update({ targetAudience: e.target.value })} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="ob-channels">Canais</Label>
        <Input id="ob-channels" value={data.channels} onChange={(e) => update({ channels: e.target.value })} />
      </div>
      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label htmlFor="ob-offer">Oferta</Label>
        <textarea id="ob-offer" rows={2} value={data.offer} onChange={(e) => update({ offer: e.target.value })} className={textareaClass} />
      </div>
      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label htmlFor="ob-positioning">Posicionamento</Label>
        <textarea id="ob-positioning" rows={2} value={data.positioning} onChange={(e) => update({ positioning: e.target.value })} className={textareaClass} />
      </div>
      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label htmlFor="ob-goals">Metas</Label>
        <textarea id="ob-goals" rows={2} value={data.goals} onChange={(e) => update({ goals: e.target.value })} className={textareaClass} />
      </div>
      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label htmlFor="ob-commercial-notes">Observações comerciais</Label>
        <textarea id="ob-commercial-notes" rows={2} value={data.commercialNotes} onChange={(e) => update({ commercialNotes: e.target.value })} className={textareaClass} />
      </div>
    </div>
  );
}

function StepReview({ data }: { data: OnboardingWizardData }) {
  const contractValue = data.contractType === "recorrente" ? `${data.monthlyValue || "—"}/mês` : data.totalValue || "—";
  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="rounded-md border border-border/60 p-4">
        <p className="font-medium">{data.clientName}</p>
        <p className="text-muted-foreground">{data.legalName || "Sem razão social informada"}</p>
        <p className="text-muted-foreground">{data.contacts.filter((c) => c.name).length} responsável(is) cadastrado(s)</p>
      </div>
      <div className="rounded-md border border-border/60 p-4">
        <p className="font-medium">Contrato {data.contractType}</p>
        <p className="text-muted-foreground">
          {data.startDate} {data.endDate ? `até ${data.endDate}` : "(sem término definido)"} · R$ {contractValue}
        </p>
      </div>
      <div className="rounded-md border border-border/60 p-4">
        <p className="font-medium">Escopo</p>
        <ul className="mt-1 flex flex-col gap-0.5 text-muted-foreground">
          {data.scopeItems
            .filter((item) => item.service)
            .map((item, index) => (
              <li key={index}>
                {item.service}
                {item.quantity ? ` · ${item.quantity}` : ""}
                {item.frequency ? ` · ${item.frequency}` : ""}
              </li>
            ))}
          {data.scopeItems.every((item) => !item.service) && <li>Nenhum item de escopo adicionado.</li>}
        </ul>
      </div>
      <p className="text-xs text-muted-foreground">
        Ao confirmar: o lead é marcado como convertido, o cliente e o contrato são criados, o escopo e as informações estratégicas ficam salvas no
        cadastro do cliente, e as tarefas padrão de onboarding são geradas.
      </p>
    </div>
  );
}
