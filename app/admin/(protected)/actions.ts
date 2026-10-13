"use server";

import { redirect } from "next/navigation";
import { POST_LOGIN_PATH } from "@/lib/admin/auth";

/**
 * Painel público (login removido): não há usuário individual pra deslogar — a sessão é de uma
 * conta de serviço compartilhada (`lib/admin/auth/auto-login.ts`). Derrubá-la só forçaria um
 * novo auto-login na request seguinte (ida e volta inútil, com possível flash de tela vazia).
 * Então "Sair" vira um simples retorno pro início do painel. O botão continua no lugar (layout
 * preservado), só deixou de ter efeito destrutivo.
 */
export async function signOutAction() {
  redirect(POST_LOGIN_PATH);
}
