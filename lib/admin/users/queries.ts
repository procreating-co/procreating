import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { User, UserRole } from "@/lib/supabase/types/database";

/** Lista de usuários internos (sócios) — usada onde um `owner_id`/`created_by` precisa virar
 *  nome exibível (Leads, Pipeline, Clientes). Único lugar que lê `public.users` em bloco. */
export async function listUsers(): Promise<User[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("users").select("*").order("name");
  return data ?? [];
}

export type PendingInvite = { id: string; name: string; email: string; role: UserRole; createdAt: string };

/** `/configuracoes/usuarios` — só os convites AINDA não usados (`used_at is null`); um convite
 *  usado já virou uma linha de verdade em `users`, listada acima, não precisa aparecer 2x. */
export async function listPendingInvites(): Promise<PendingInvite[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("team_invites")
    .select("id, name, email, role, created_at")
    .is("used_at", null)
    .order("created_at", { ascending: false });
  return (data ?? []).map((row) => ({ id: row.id, name: row.name, email: row.email, role: row.role as UserRole, createdAt: row.created_at }));
}
