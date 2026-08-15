"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/current-user";
import type { ContractCategory, ContractStatus, ContractType } from "@/lib/supabase/types/database";

export type ActionResult = { ok: true } | { ok: false; error: string };

export type ContractFormInput = {
  type: ContractType;
  status: ContractStatus;
  startDate: string;
  endDate: string | null;
  monthlyValue: number | null;
  totalValue: number | null;
  dueDay: number | null;
  paymentTerms: string | null;
  specialConditions: string | null;
};

/** `category` nunca é escolhida na UI — é 100% derivada de `type`+`status`, a mesma regra da
 *  migration de backfill (`20260816000000_contract_category.sql`) e do `close_lead_and_
 *  create_client` (correção `20260816020000`). Um contrato recorrente ativo É `recorrente_ativo`
 *  por definição — deixar a categoria solta pra edição manual reabriria exatamente o bug que a
 *  categoria foi criada pra fechar (MRR calculado errado por estado inconsistente). */
function deriveCategory(type: ContractType, status: ContractStatus): ContractCategory {
  if (type === "recorrente") return status === "ativo" ? "recorrente_ativo" : "recorrente_churn";
  return status === "ativo" ? "pontual_em_andamento" : "pontual_concluido";
}

function validate(input: ContractFormInput): string | null {
  if (!input.startDate) return "Informe a data de início.";
  if (input.type === "recorrente" && (input.monthlyValue == null || input.monthlyValue <= 0)) return "Informe o valor mensal.";
  if (input.type === "pontual" && (input.totalValue == null || input.totalValue <= 0)) return "Informe o valor total.";
  if (input.dueDay != null && (input.dueDay < 1 || input.dueDay > 31)) return "Dia de vencimento deve ser entre 1 e 31.";
  return null;
}

export async function createContractAction(clientId: string, input: ContractFormInput): Promise<ActionResult> {
  const validationError = validate(input);
  if (validationError) return { ok: false, error: validationError };

  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Sessão expirada — faça login de novo." };

  const supabase = await createClient();
  const { error } = await supabase.from("contracts").insert({
    client_id: clientId,
    type: input.type,
    status: input.status,
    category: deriveCategory(input.type, input.status),
    start_date: input.startDate,
    end_date: input.endDate,
    monthly_value: input.type === "recorrente" ? input.monthlyValue : null,
    total_value: input.type === "pontual" ? input.totalValue : null,
    due_day: input.type === "recorrente" ? input.dueDay : null,
    payment_terms: input.paymentTerms,
    special_conditions: input.specialConditions,
    created_by: userId,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/clientes/${clientId}`);
  revalidatePath("/clientes");
  revalidatePath("/financeiro");
  revalidatePath("/");
  return { ok: true };
}

export async function updateContractAction(contractId: string, clientId: string, input: ContractFormInput): Promise<ActionResult> {
  const validationError = validate(input);
  if (validationError) return { ok: false, error: validationError };

  const supabase = await createClient();
  const { error } = await supabase
    .from("contracts")
    .update({
      type: input.type,
      status: input.status,
      category: deriveCategory(input.type, input.status),
      start_date: input.startDate,
      end_date: input.endDate,
      monthly_value: input.type === "recorrente" ? input.monthlyValue : null,
      total_value: input.type === "pontual" ? input.totalValue : null,
      due_day: input.type === "recorrente" ? input.dueDay : null,
      payment_terms: input.paymentTerms,
      special_conditions: input.specialConditions,
      updated_at: new Date().toISOString(),
    })
    .eq("id", contractId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/clientes/${clientId}`);
  revalidatePath("/clientes");
  revalidatePath("/financeiro");
  revalidatePath("/");
  return { ok: true };
}
