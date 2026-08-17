"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { OnboardingWizardData } from "@/lib/onboarding/types";

export type CloseLeadResult = { ok: true; clientId: string } | { ok: false; error: string };

function toNumber(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Chama `close_lead_and_create_client` (RPC, ver a migration
 * `20260813010000_comercial_financeiro_onboarding.sql`) — é a transação real da Etapa 5 do
 * onboarding: cliente, contrato, escopo, dados estratégicos, contatos, tarefas padrão, receita
 * projetada e a conversão do lead, tudo atômico dentro da função. Este Server Action só monta o
 * payload jsonb e chama `supabase.rpc(...)` — nenhum insert direto aqui.
 */
export async function closeLeadAction(leadId: string, data: OnboardingWizardData): Promise<CloseLeadResult> {
  if (!data.startDate) return { ok: false, error: "Informe a data de início do contrato." };
  if (data.contractType === "recorrente" && toNumber(data.monthlyValue) == null) {
    return { ok: false, error: "Informe o valor mensal do contrato recorrente." };
  }
  if (data.contractType === "pontual" && toNumber(data.totalValue) == null) {
    return { ok: false, error: "Informe o valor total do contrato pontual." };
  }

  const payload = {
    client: { name: data.clientName || undefined },
    onboarding: {
      legal_name: data.legalName || null,
      trade_name: data.tradeName || null,
      cnpj: data.cnpj || null,
      cpf: data.cpf || null,
      address: data.address || null,
      billing_info: data.billingInfo || null,
      objective: data.objective || null,
      target_audience: data.targetAudience || null,
      offer: data.offer || null,
      positioning: data.positioning || null,
      channels: data.channels || null,
      goals: data.goals || null,
      commercial_notes: data.commercialNotes || null,
    },
    contacts: data.contacts
      .filter((contact) => contact.name.trim() !== "")
      .map((contact) => ({
        name: contact.name,
        role_title: contact.roleTitle || null,
        email: contact.email || null,
        whatsapp: contact.whatsapp || null,
        is_primary: contact.isPrimary,
      })),
    contract: {
      type: data.contractType,
      start_date: data.startDate,
      end_date: data.endDate || null,
      monthly_value: toNumber(data.monthlyValue),
      due_day: toNumber(data.dueDay),
      auto_renew: data.autoRenew,
      total_value: toNumber(data.totalValue),
      payment_terms: data.paymentTerms || null,
      special_conditions: data.specialConditions || null,
    },
    scope_items: data.scopeItems
      .filter((item) => item.service.trim() !== "")
      .map((item) => ({
        service: item.service,
        quantity: toNumber(item.quantity),
        frequency: item.frequency || null,
        deadline: item.deadline || null,
        notes: item.notes || null,
      })),
  };

  const supabase = await createClient();
  const { data: clientId, error } = await supabase.rpc("close_lead_and_create_client", {
    p_lead_id: leadId,
    p_payload: payload,
  });

  if (error) return { ok: false, error: error.message };

  // Bug real (achado via verificação direta no banco, não hipótese) — este era o único Server
  // Action de escrita do app sem nenhum revalidatePath. Os dois pontos de chamada (onboarding-
  // modal.tsx via pipeline-board.tsx e quick-add-menu.tsx) navegam pro cliente novo com
  // `router.push` logo depois, sem `router.refresh()` — então o Router Cache do Next seguia
  // servindo o payload antigo de Home/Financeiro/Comercial/Clientes até expirar sozinho, dando a
  // impressão de que o valor do negócio fechado "sumiu".
  const id = clientId as unknown as string;
  revalidatePath("/");
  revalidatePath("/financeiro");
  revalidatePath("/comercial");
  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  return { ok: true, clientId: id };
}
