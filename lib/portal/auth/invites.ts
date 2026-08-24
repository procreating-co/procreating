import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Convites de Portal — mesma forma de `lib/admin/auth/partners.ts` (`getTeamInvite`), tabela
 * `client_portal_invites` (migration `20260824030000_client_portal_invites_and_anon_fix.sql`).
 * `get_client_portal_invite` é `SECURITY DEFINER` — devolve no máximo a linha do e-mail pedido,
 * nunca a tabela inteira. A baixa do convite (`used_at`) acontece dentro de
 * `claim_client_portal_invite` (`app/portal/signup/actions.ts`), não aqui — por isso não existe
 * um `markClientPortalInviteUsed` neste arquivo (a função SQL `mark_client_portal_invite_used`
 * segue existindo, só não é chamada por nenhum caminho de app hoje).
 */
export type ClientPortalInvite = { clientId: string; name: string; usedAt: string | null };

export async function getClientPortalInvite(email: string): Promise<ClientPortalInvite | null> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_client_portal_invite", { p_email: email.trim().toLowerCase() });
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  return { clientId: row.client_id, name: row.name, usedAt: row.used_at };
}
