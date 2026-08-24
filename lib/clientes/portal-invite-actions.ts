"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/current-user";
import type { ClientPortalInviteRow } from "@/lib/supabase/types/database";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Convida um contato do cliente a acessar o Portal (`client_portal_invites`) — mesmo padrão de
 *  `inviteTeamMemberAction` (`lib/admin/auth/actions.ts`): a pessoa se cadastra sozinha em
 *  `/portal/signup` com esse e-mail depois; não criamos a conta aqui. */
export async function inviteClientPortalUserAction(clientId: string, name: string, email: string): Promise<ActionResult> {
  if (!name.trim()) return { ok: false, error: "Informe o nome." };
  if (!email.trim()) return { ok: false, error: "Informe o e-mail." };

  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Sessão expirada — faça login de novo." };

  const supabase = await createClient();
  const { error } = await supabase.from("client_portal_invites").insert({
    client_id: clientId,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    invited_by: userId,
  });
  if (error) {
    if (error.code === "23505") return { ok: false, error: "Esse e-mail já foi convidado." };
    return { ok: false, error: error.message };
  }

  revalidatePath(`/clientes/${clientId}`);
  return { ok: true };
}

/** Só apaga convite ainda NÃO usado — mesma regra de `revokeInviteAction` (equipe): um `used_at`
 *  preenchido significa que a pessoa já é um `client_portal_users` de verdade; revogar a essa
 *  altura não desfaria o acesso (precisaria desativar `is_active`, não apagar o convite). */
export async function revokeClientPortalInviteAction(inviteId: string, clientId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("client_portal_invites").delete().eq("id", inviteId).is("used_at", null);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/clientes/${clientId}`);
  return { ok: true };
}

export async function listClientPortalInvites(clientId: string): Promise<ClientPortalInviteRow[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("client_portal_invites").select("*").eq("client_id", clientId).order("created_at", { ascending: false });
  return data ?? [];
}
