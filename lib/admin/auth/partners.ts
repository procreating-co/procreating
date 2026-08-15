import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Convites de equipe — antes um array hardcoded (`PARTNER_ALLOWLIST`), agora a tabela
 * `team_invites` (migration `20260815000000_team_invites.sql`), gerenciável pelo menu **+**
 * (`quick-add-menu.tsx`, "Novo membro da equipe") em vez de exigir editar código pra crescer o
 * time. `get_team_invite` é `SECURITY DEFINER` — devolve no máximo a linha do e-mail pedido,
 * nunca a tabela inteira (não existe policy de SELECT anônimo em `team_invites`).
 */
export type TeamInvite = { name: string; role: string; usedAt: string | null };

export async function getTeamInvite(email: string): Promise<TeamInvite | null> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_team_invite", { p_email: email.trim().toLowerCase() });
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  return { name: row.name, role: row.role, usedAt: row.used_at };
}

export async function isPartnerEmail(email: string): Promise<boolean> {
  const invite = await getTeamInvite(email);
  return invite != null && invite.usedAt == null;
}

export async function markTeamInviteUsed(email: string): Promise<void> {
  const supabase = await createClient();
  await supabase.rpc("mark_team_invite_used", { p_email: email.trim().toLowerCase() });
}
