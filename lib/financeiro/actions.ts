"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireFinancialAccess } from "@/lib/auth/permissions";
import { todayISO } from "@/lib/date";
import type { CostInput, ExpenseInput } from "@/lib/financeiro/types";
import type { FinancialEntryStatus } from "@/lib/supabase/types/database";

export type ActionResult = { ok: true } | { ok: false; error: string };

// RBAC mínimo (Passo 1 item 2) — toda action deste arquivo chama `requireFinancialAccess()`
// primeiro (owner/admin/finance apenas). Substitui as chamadas soltas a `getCurrentUserId()`
// que existiam antes: o resultado da permissão já traz `userId`, uma ida a menos ao servidor.

export async function createExpenseAction(input: ExpenseInput): Promise<ActionResult> {
  const access = await requireFinancialAccess();
  if (!access.ok) return access;

  if (!input.category.trim()) return { ok: false, error: "Informe a categoria." };
  if (!input.description.trim()) return { ok: false, error: "Informe a descrição." };
  if (!input.dueDate) return { ok: false, error: "Informe o vencimento." };

  const supabase = await createClient();
  const { error } = await supabase.from("expenses").insert({
    category: input.category,
    description: input.description,
    amount: input.amount,
    due_date: input.dueDate,
    created_by: access.userId,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/financeiro");
  return { ok: true };
}

/** "ERP totalmente funcional" — antes só dava pra criar despesa e trocar status; corrigir um
 *  valor/categoria digitado errado, ou desistir de uma despesa lançada por engano, exigia ir
 *  direto no banco. */
export async function updateExpenseAction(id: string, input: ExpenseInput): Promise<ActionResult> {
  const access = await requireFinancialAccess();
  if (!access.ok) return access;

  if (!input.category.trim()) return { ok: false, error: "Informe a categoria." };
  if (!input.description.trim()) return { ok: false, error: "Informe a descrição." };
  if (!input.dueDate) return { ok: false, error: "Informe o vencimento." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("expenses")
    .update({ category: input.category, description: input.description, amount: input.amount, due_date: input.dueDate })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/financeiro");
  return { ok: true };
}

export async function deleteExpenseAction(id: string): Promise<ActionResult> {
  const access = await requireFinancialAccess();
  if (!access.ok) return access;

  const supabase = await createClient();
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/financeiro");
  return { ok: true };
}

/** Automação §72 regra 3 — janela de "vencendo em N dias", configurável (era uma constante fixa
 *  em código). Atualiza a linha mais recente de `financial_rules` (mesma tabela de config de 1
 *  linha que `operational_percentage` já usa) — nunca cria uma segunda linha. */
export async function updateReceivablesAlertDaysAction(days: number): Promise<ActionResult> {
  const access = await requireFinancialAccess();
  if (!access.ok) return access;

  if (!Number.isFinite(days) || days <= 0) return { ok: false, error: "Informe um número de dias maior que zero." };

  const supabase = await createClient();
  const { data: rule } = await supabase.from("financial_rules").select("id").order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!rule) return { ok: false, error: "Nenhuma regra financeira cadastrada ainda." };

  const { error } = await supabase.from("financial_rules").update({ receivables_alert_days: Math.round(days), updated_at: new Date().toISOString() }).eq("id", rule.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/configuracoes/regras-financeiras");
  revalidatePath("/financeiro");
  revalidatePath("/");
  return { ok: true };
}

export async function updateRevenueStatusAction(id: string, status: FinancialEntryStatus): Promise<ActionResult> {
  const access = await requireFinancialAccess();
  if (!access.ok) return access;

  const supabase = await createClient();
  const { error } = await supabase
    .from("revenue")
    .update({ status, paid_at: status === "pago" ? todayISO() : null })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/financeiro");
  return { ok: true };
}

export async function updateExpenseStatusAction(id: string, status: FinancialEntryStatus): Promise<ActionResult> {
  const access = await requireFinancialAccess();
  if (!access.ok) return access;

  const supabase = await createClient();
  const { error } = await supabase
    .from("expenses")
    .update({ status, paid_at: status === "pago" ? todayISO() : null })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/financeiro");
  return { ok: true };
}

export async function createCostAction(input: CostInput): Promise<ActionResult> {
  const access = await requireFinancialAccess();
  if (!access.ok) return access;

  if (!input.name.trim()) return { ok: false, error: "Informe o nome do custo." };
  if (!input.category.trim()) return { ok: false, error: "Informe a categoria." };

  const supabase = await createClient();
  const { error } = await supabase.from("costs").insert({
    name: input.name,
    amount: input.amount,
    category: input.category,
    recurrence: input.recurrence,
    created_by: access.userId,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/financeiro");
  return { ok: true };
}

export async function updateCostAction(id: string, input: CostInput): Promise<ActionResult> {
  const access = await requireFinancialAccess();
  if (!access.ok) return access;

  if (!input.name.trim()) return { ok: false, error: "Informe o nome do custo." };
  if (!input.category.trim()) return { ok: false, error: "Informe a categoria." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("costs")
    .update({ name: input.name, amount: input.amount, category: input.category, recurrence: input.recurrence, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/financeiro");
  return { ok: true };
}

export async function deleteCostAction(id: string): Promise<ActionResult> {
  const access = await requireFinancialAccess();
  if (!access.ok) return access;

  const supabase = await createClient();
  const { error } = await supabase.from("costs").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/financeiro");
  return { ok: true };
}
