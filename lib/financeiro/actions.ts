"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/current-user";
import type { CostInput, ExpenseInput } from "@/lib/financeiro/types";
import type { FinancialEntryStatus } from "@/lib/supabase/types/database";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function createExpenseAction(input: ExpenseInput): Promise<ActionResult> {
  if (!input.category.trim()) return { ok: false, error: "Informe a categoria." };
  if (!input.description.trim()) return { ok: false, error: "Informe a descrição." };
  if (!input.dueDate) return { ok: false, error: "Informe o vencimento." };

  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Sessão expirada — faça login de novo." };

  const supabase = await createClient();
  const { error } = await supabase.from("expenses").insert({
    category: input.category,
    description: input.description,
    amount: input.amount,
    due_date: input.dueDate,
    created_by: userId,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/financeiro");
  revalidatePath("/financeiro/despesas");
  revalidatePath("/financeiro/contas-a-pagar");
  return { ok: true };
}

export async function updateRevenueStatusAction(id: string, status: FinancialEntryStatus): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("revenue")
    .update({ status, paid_at: status === "pago" ? new Date().toISOString().slice(0, 10) : null })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/financeiro");
  revalidatePath("/financeiro/receitas");
  revalidatePath("/financeiro/contas-a-receber");
  return { ok: true };
}

export async function updateExpenseStatusAction(id: string, status: FinancialEntryStatus): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("expenses")
    .update({ status, paid_at: status === "pago" ? new Date().toISOString().slice(0, 10) : null })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/financeiro");
  revalidatePath("/financeiro/despesas");
  revalidatePath("/financeiro/contas-a-pagar");
  return { ok: true };
}

export async function createCostAction(input: CostInput): Promise<ActionResult> {
  if (!input.name.trim()) return { ok: false, error: "Informe o nome do custo." };
  if (!input.category.trim()) return { ok: false, error: "Informe a categoria." };

  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Sessão expirada — faça login de novo." };

  const supabase = await createClient();
  const { error } = await supabase.from("costs").insert({
    name: input.name,
    amount: input.amount,
    category: input.category,
    recurrence: input.recurrence,
    created_by: userId,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/financeiro");
  revalidatePath("/financeiro/custos");
  return { ok: true };
}

export async function deleteCostAction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("costs").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/financeiro");
  revalidatePath("/financeiro/custos");
  return { ok: true };
}
