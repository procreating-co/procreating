"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTeamInvite, markTeamInviteUsed } from "@/lib/admin/auth/partners";
import { setAdminSessionCookie } from "@/lib/admin/auth/session-cookie";
import { POST_LOGIN_PATH } from "@/lib/admin/auth/constants";
import type { UserRole } from "@/lib/supabase/types/database";

export type SignUpFormState = { error?: string; success?: string } | undefined;

/**
 * Cadastro de membro da equipe — só aceita e-mail com convite pendente em `team_invites`
 * (criado via menu **+** → "Novo membro da equipe", `lib/comercial`... na verdade
 * `quick-add-menu.tsx`). O `role` vem do convite (quem convidou já escolheu o cargo), não mais
 * hardcoded `"owner"` — era assim quando só existiam 2 sócios possíveis, deixou de valer quando
 * o convite passou a aceitar qualquer cargo.
 *
 * Se o projeto Supabase exigir confirmação de e-mail (padrão), `signUp` não devolve sessão —
 * nesse caso mandamos pra tela de login com um aviso, em vez de logar direto.
 */
export async function signUpAction(_prevState: SignUpFormState, formData: FormData): Promise<SignUpFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    return { error: "Preencha nome, e-mail e senha." };
  }
  const invite = await getTeamInvite(email);
  if (!invite || invite.usedAt != null) {
    return { error: "Este e-mail não tem um convite pendente. Peça pra alguém do time te convidar (menu + → Novo membro da equipe)." };
  }
  if (password.length < 8) {
    return { error: "A senha precisa ter pelo menos 8 caracteres." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    return { error: error.message };
  }
  if (!data.user) {
    return { error: "Não foi possível criar a conta agora. Tente novamente." };
  }

  const { error: profileError } = await supabase.from("users").insert({ id: data.user.id, name, email, role: invite.role as UserRole });
  if (profileError) {
    return { error: `Conta criada, mas o perfil falhou (${profileError.message}). Avise o Santiago antes de tentar de novo.` };
  }
  await markTeamInviteUsed(email);

  if (!data.session) {
    // Confirmação de e-mail está ligada no projeto Supabase — sem sessão ainda.
    return { success: "Conta criada! Confira seu e-mail pra confirmar o acesso e depois entre em /admin/login." };
  }

  await setAdminSessionCookie();
  redirect(POST_LOGIN_PATH);
}
