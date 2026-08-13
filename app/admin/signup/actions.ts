"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPartnerEmail } from "@/lib/admin/auth/partners";
import { setAdminSessionCookie } from "@/lib/admin/auth/session-cookie";
import { ADMIN_HOME_PATH } from "@/lib/admin/auth/constants";

export type SignUpFormState = { error?: string; success?: string } | undefined;

/**
 * Cadastro do segundo sócio (Eduardo) — só aceita email na allowlist
 * (`lib/admin/auth/partners.ts`). Cria a conta no Supabase Auth e a linha correspondente em
 * `public.users` com `role: "owner"` (mesmo nível do Santiago, conforme pedido).
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
  if (!isPartnerEmail(email)) {
    return { error: "Este e-mail não está autorizado a criar uma conta. Fale com o Santiago." };
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

  const { error: profileError } = await supabase.from("users").insert({ id: data.user.id, name, email, role: "owner" });
  if (profileError) {
    return { error: `Conta criada, mas o perfil falhou (${profileError.message}). Avise o Santiago antes de tentar de novo.` };
  }

  if (!data.session) {
    // Confirmação de e-mail está ligada no projeto Supabase — sem sessão ainda.
    return { success: "Conta criada! Confira seu e-mail pra confirmar o acesso e depois entre em /admin/login." };
  }

  await setAdminSessionCookie();
  redirect(ADMIN_HOME_PATH);
}
