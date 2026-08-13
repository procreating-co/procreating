import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@/lib/supabase/types/database";

/** Lista de usuários internos (sócios) — usada onde um `owner_id`/`created_by` precisa virar
 *  nome exibível (Leads, Pipeline, Clientes). Único lugar que lê `public.users` em bloco. */
export async function listUsers(): Promise<User[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("users").select("*").order("name");
  return data ?? [];
}
