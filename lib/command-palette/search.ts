"use server";

import { createClient } from "@/lib/supabase/server";

export type CommandPaletteResults = {
  clients: { id: string; name: string }[];
  leads: { id: string; company_name: string }[];
  tasks: { id: string; title: string }[];
  strategies: { id: string; name: string }[];
  expenses: { id: string; description: string }[];
  costs: { id: string; name: string }[];
};

const EMPTY_RESULTS: CommandPaletteResults = { clients: [], leads: [], tasks: [], strategies: [], expenses: [], costs: [] };

/** Busca do ⌘K — clientes, leads, tarefas, estratégias, despesas e custos por nome/título, 5 de
 *  cada, mais recente/relevante primeiro. Server Action (não uma query client-side direta) pra
 *  não expor mais superfície de acesso ao Supabase no bundle do cliente do que o resto do produto
 *  já expõe. */
export async function searchCommandPaletteAction(query: string): Promise<CommandPaletteResults> {
  const term = query.trim();
  if (term.length < 1) return EMPTY_RESULTS;

  const supabase = await createClient();
  const [{ data: clients }, { data: leads }, { data: tasks }, { data: strategies }, { data: expenses }, { data: costs }] = await Promise.all([
    supabase.from("clients").select("id, name").ilike("name", `%${term}%`).order("name").limit(5),
    supabase.from("leads").select("id, company_name").ilike("company_name", `%${term}%`).order("created_at", { ascending: false }).limit(5),
    supabase.from("tasks").select("id, title").ilike("title", `%${term}%`).order("created_at", { ascending: false }).limit(5),
    supabase.from("strategies").select("id, name").ilike("name", `%${term}%`).order("name").limit(5),
    supabase.from("expenses").select("id, description").ilike("description", `%${term}%`).order("due_date", { ascending: false }).limit(5),
    supabase.from("costs").select("id, name").ilike("name", `%${term}%`).order("name").limit(5),
  ]);

  return { clients: clients ?? [], leads: leads ?? [], tasks: tasks ?? [], strategies: strategies ?? [], expenses: expenses ?? [], costs: costs ?? [] };
}
