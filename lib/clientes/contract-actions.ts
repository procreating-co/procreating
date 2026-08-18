"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/current-user";
import type { ContractCategory, ContractStatus, ContractType } from "@/lib/supabase/types/database";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

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
 *  categoria foi criada pra fechar (MRR calculado errado por estado inconsistente). Base
 *  simples/pura de propósito — não sabe nada sobre outros contratos do cliente; quem decide
 *  "isto foi renovado, não perdido" é `reconcileRenewedContracts`, chamada logo depois de salvar
 *  (ver abaixo). */
function deriveCategory(type: ContractType, status: ContractStatus): ContractCategory {
  if (type === "recorrente") return status === "ativo" ? "recorrente_ativo" : "recorrente_churn";
  return status === "ativo" ? "pontual_em_andamento" : "pontual_concluido";
}

/**
 * Achado real (Bruna Gonçalves Montenegro, Maria Tabarez): `deriveCategory` rotulava TODO
 * recorrente encerrado como `recorrente_churn`, mesmo quando o cliente nunca saiu — só renovou
 * pra um contrato novo (data de início do novo = data de fim do antigo, sem gap). Isso também
 * significava que a correção manual de um caso desses seria revertida sozinha na próxima vez que
 * alguém editasse aquele contrato (`updateContractAction` recalcula `category` do zero a cada
 * save). Fix na raiz: depois de criar/editar um contrato, reconcilia TODOS os recorrentes
 * encerrados desse cliente — se existir outro contrato recorrente do mesmo cliente começando no
 * dia (ou depois) em que este terminou, é renovação (`recorrente_renovado`), não churn.
 * Self-healing: roda de novo a cada escrita, então nunca fica desatualizado nem depende de
 * alguém lembrar de rodar uma correção manual.
 */
async function reconcileRenewedContracts(supabase: SupabaseServerClient, clientId: string): Promise<void> {
  const { data: contracts } = await supabase.from("contracts").select("id, type, status, category, start_date, end_date").eq("client_id", clientId);
  if (!contracts) return;

  for (const contract of contracts) {
    if (contract.type !== "recorrente" || contract.status === "ativo" || !contract.end_date) continue;
    const wasRenewed = contracts.some((other) => other.id !== contract.id && other.type === "recorrente" && other.start_date >= contract.end_date!);
    const correctCategory: ContractCategory = wasRenewed ? "recorrente_renovado" : "recorrente_churn";
    if (contract.category !== correctCategory) {
      await supabase.from("contracts").update({ category: correctCategory }).eq("id", contract.id);
    }
  }
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
  await reconcileRenewedContracts(supabase, clientId);

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
  await reconcileRenewedContracts(supabase, clientId);

  revalidatePath(`/clientes/${clientId}`);
  revalidatePath("/clientes");
  revalidatePath("/financeiro");
  revalidatePath("/");
  return { ok: true };
}
