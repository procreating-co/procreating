"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getClientPortalInvite } from "@/lib/portal/auth/invites";
import { setPortalSessionCookie } from "@/lib/portal/auth/session-cookie";

export type PortalSignUpFormState = { error?: string; success?: string } | undefined;

/**
 * Cadastro de cliente — mesma forma de `app/admin/signup/actions.ts`, só aceita e-mail com
 * convite pendente em `client_portal_invites` (criado pelo staff em `/clientes/[id]`, ver
 * `lib/clientes/portal-invite-actions.ts`).
 *
 * O vínculo (`client_portal_users`) e a baixa do convite acontecem numa função só,
 * `claim_client_portal_invite` (`SECURITY DEFINER`) — a sessão recém-criada NÃO tem permissão
 * pra inserir em `client_portal_users` diretamente (só staff escreve lá, RLS da Fase A), achado
 * real num teste end-to-end desta mesma implementação. A função confirma internamente que o
 * e-mail do convite bate com o e-mail autenticado de `auth.uid()` antes de vincular.
 */
export async function portalSignUpAction(_prevState: PortalSignUpFormState, formData: FormData): Promise<PortalSignUpFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Preencha e-mail e senha." };
  }
  const invite = await getClientPortalInvite(email);
  if (!invite || invite.usedAt != null) {
    return { error: "Este e-mail não tem um convite pendente. Peça pra sua agência te convidar de novo." };
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

  if (!data.session) {
    // Confirmação de e-mail está ligada no projeto Supabase — sem sessão ainda, não dá pra
    // chamar `claim_client_portal_invite` (precisa de `auth.uid()`). O vínculo acontece no
    // primeiro login bem-sucedido — ver `lib/portal/auth/provider.ts` se isso virar necessário;
    // hoje (confirmação desligada, confirmado em teste) este caminho não é exercitado.
    return { success: "Conta criada! Confira seu e-mail pra confirmar o acesso e depois entre em /portal/login." };
  }

  const { data: clientId, error: claimError } = await supabase.rpc("claim_client_portal_invite", { p_email: email });
  if (claimError || !clientId) {
    return { error: "Conta criada, mas o vínculo com o cliente falhou. Avise sua agência antes de tentar de novo." };
  }

  await setPortalSessionCookie();
  const { data: clientRows } = await supabase.rpc("get_my_portal_client");
  const client = Array.isArray(clientRows) ? clientRows[0] : clientRows;
  redirect(client ? `/portal/${client.slug}` : "/portal/login");
}
