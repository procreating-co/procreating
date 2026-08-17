"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/current-user";
import { requireUserManagementAccess } from "@/lib/auth/permissions";
import type { UserRole } from "@/lib/supabase/types/database";

export type ActionResult = { ok: true } | { ok: false; error: string };

export type TeamInviteInput = { name: string; email: string; role: UserRole };

/** Convida um novo membro de equipe (`team_invites`) — a pessoa se cadastra sozinha em
 *  `/admin/signup` com esse e-mail depois; não cria a conta aqui (só quem cadastra a própria
 *  senha deveria conhecê-la). Ver `lib/admin/auth/partners.ts` pra como o convite é consumido. */
export async function inviteTeamMemberAction(input: TeamInviteInput): Promise<ActionResult> {
  if (!input.name.trim()) return { ok: false, error: "Informe o nome." };
  if (!input.email.trim()) return { ok: false, error: "Informe o e-mail." };

  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Sessão expirada — faça login de novo." };

  const supabase = await createClient();
  const { error } = await supabase.from("team_invites").insert({
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    role: input.role,
    invited_by: userId,
  });
  if (error) {
    if (error.code === "23505") return { ok: false, error: "Esse e-mail já foi convidado." };
    return { ok: false, error: error.message };
  }

  revalidatePath("/configuracoes/usuarios");
  return { ok: true };
}

/** "ERP totalmente funcional" — tela de gestão de usuários (`/configuracoes/usuarios`) precisa
 *  poder desistir de um convite mandado errado, sem ir direto no banco. Só apaga convite ainda
 *  NÃO usado — um `used_at` preenchido significa que a pessoa já é um `users` de verdade; revogar
 *  a essa altura não faria sentido (a conta já existe, revogar não a apagaria). */
export async function revokeInviteAction(inviteId: string): Promise<ActionResult> {
  const access = await requireUserManagementAccess();
  if (!access.ok) return access;

  const supabase = await createClient();
  const { error } = await supabase.from("team_invites").delete().eq("id", inviteId).is("used_at", null);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/configuracoes/usuarios");
  return { ok: true };
}
