import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types/database";
import type { AdminUser } from "@/lib/admin/auth/types";
import { createServiceClient, serviceRoleConfigured } from "@/lib/supabase/service";

/**
 * Usuário "visitante" — último recurso quando NENHUMA credencial está configurada (sem
 * `SUPABASE_SERVICE_ROLE_KEY` e sem `ADMIN_AUTO_EMAIL/PASSWORD`). Em vez de bloquear o painel, ele
 * abre direto neste perfil (acesso de owner na UI; os dados ficam sujeitos ao que o RLS libera sem
 * sessão autenticada — tabelas `to public` aparecem, tabelas só `to authenticated` vêm vazias).
 * Assim o link SEMPRE abre. Pra ter os dados completos, configure a chave de serviço, que faz o
 * auto-login numa conta owner real e substitui este modo automaticamente.
 */
export const PUBLIC_FALLBACK_USER: AdminUser = {
  id: "00000000-0000-0000-0000-000000000000",
  name: "Visitante",
  email: "visitante@procreating.co",
  role: "owner",
  theme: null,
  avatarUrl: null,
};

/**
 * Painel interno PÚBLICO (login removido) — em vez de pedir e-mail/senha, o ERP mantém por baixo
 * uma sessão Supabase Auth real de uma conta de serviço `owner`. Isso é o que faz os dados
 * continuarem funcionando: existem 74 policies RLS marcadas `to authenticated`, então uma request
 * sem sessão consultaria o banco como `anon` e viria vazia. Mantendo uma sessão autenticada de
 * verdade, nenhuma policy do banco precisa ser afrouxada e nenhuma chave secreta vai parar no
 * navegador — só a sessão normal de um usuário owner.
 *
 * ZERO PASSO MANUAL: basta definir `SUPABASE_SERVICE_ROLE_KEY` no ambiente (Vercel → Settings →
 * Environment Variables; o valor está no Supabase → Settings → API → `service_role`). Com ela, se
 * a conta de serviço ainda não existir, o próprio painel a CRIA e CONFIRMA automaticamente no
 * primeiro acesso (`provisionServiceAccount` abaixo) — sem SQL, sem confirmar e-mail, sem arrumar
 * senha na mão. O e-mail/senha da conta têm padrão embutido e só precisam ser mexidos se você
 * quiser outros (`ADMIN_AUTO_EMAIL` / `ADMIN_AUTO_PASSWORD`).
 *
 * ATENÇÃO DE SEGURANÇA: com isto, qualquer pessoa que abrir a URL do painel entra com acesso total
 * de owner (dados reais de clientes, financeiro, operações administrativas). É intencional (painel
 * aberto), mas não é "um pouco aberto": é acesso irrestrito.
 */
export const AUTO_LOGIN_EMAIL = process.env.ADMIN_AUTO_EMAIL || "painel-publico@procreating.co";
export const AUTO_LOGIN_PASSWORD = process.env.ADMIN_AUTO_PASSWORD || "procreating-painel-publico";

/**
 * O auto-login está disponível se der pra provisionar/garantir a conta via service_role, OU se
 * um e-mail/senha de uma conta já existente forem fornecidos explicitamente.
 */
export function autoLoginConfigured(): boolean {
  return serviceRoleConfigured() || Boolean(process.env.ADMIN_AUTO_EMAIL && process.env.ADMIN_AUTO_PASSWORD);
}

/**
 * Cache de resultado POR INSTÂNCIA (serverless/edge) — crucial pra performance. Sem uma sessão
 * persistida (cookie), o auto-login seria chamado a CADA request; se ele está falhando (ex.: chave
 * errada), toda navegação pagaria várias idas ao Supabase à toa, deixando o painel lentíssimo. Com
 * um TTL negativo curto, uma falha recente faz os próximos requests caírem direto no modo visitante,
 * sem rede. Quando a chave estiver certa, o login dá certo uma vez, o `proxy.ts` persiste o cookie e
 * isto deixa de ser chamado.
 */
let lastOutcome: { ok: boolean; at: number } | null = null;
const NEGATIVE_TTL_MS = 60_000;
/** Provisionamento (criar/confirmar a conta) é caro (lista usuários) — no máximo uma vez por instância. */
let provisionTried = false;

export function autoLoginRecentlyFailed(): boolean {
  return lastOutcome !== null && !lastOutcome.ok && Date.now() - lastOutcome.at < NEGATIVE_TTL_MS;
}
export function recordAutoLoginOutcome(ok: boolean): void {
  lastOutcome = { ok, at: Date.now() };
}

/**
 * Garante que a conta de serviço exista, esteja com e-mail confirmado e com a senha esperada, e
 * tenha a linha correspondente em `public.users` (o `getSession()` exige o perfil). Idempotente:
 * seguro rodar várias vezes. Usa a chave de serviço, que ignora o RLS.
 */
async function provisionServiceAccount(): Promise<void> {
  if (!serviceRoleConfigured()) return;
  const admin = createServiceClient();

  const created = await admin.auth.admin.createUser({
    email: AUTO_LOGIN_EMAIL,
    password: AUTO_LOGIN_PASSWORD,
    email_confirm: true,
  });

  let userId = created.data.user?.id;
  if (!userId) {
    // Provavelmente já existe — acha o id e regrava senha/confirmação pra garantir o login.
    const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existing = data.users.find((u) => u.email?.toLowerCase() === AUTO_LOGIN_EMAIL.toLowerCase());
    if (existing) {
      userId = existing.id;
      await admin.auth.admin.updateUserById(userId, { password: AUTO_LOGIN_PASSWORD, email_confirm: true });
    }
  }

  if (userId) {
    await admin.from("users").upsert({ id: userId, name: "Painel", email: AUTO_LOGIN_EMAIL, role: "owner" }, { onConflict: "id" });
  }
}

/**
 * Loga a conta de serviço no client Supabase recebido. O client é responsável por gravar os
 * cookies de sessão (sb-*) via seu próprio adapter de cookies — por isso isto serve tanto pro
 * client de Server Component (`lib/supabase/server.ts`) quanto pro de middleware (`proxy.ts`).
 * Se o primeiro login falhar (conta ainda não existe/confirmada), provisiona e tenta de novo.
 * Devolve `true` se a sessão foi estabelecida.
 */
export async function performAutoLogin(supabase: SupabaseClient<Database>): Promise<boolean> {
  if (!autoLoginConfigured()) return false;
  // Falhou há pouco nesta instância? Não repete o custo — vai direto pro visitante.
  if (autoLoginRecentlyFailed()) return false;

  let { error } = await supabase.auth.signInWithPassword({ email: AUTO_LOGIN_EMAIL, password: AUTO_LOGIN_PASSWORD });
  if (error && serviceRoleConfigured() && !provisionTried) {
    // Provisiona só uma vez por instância (a listagem de usuários é cara).
    provisionTried = true;
    await provisionServiceAccount();
    ({ error } = await supabase.auth.signInWithPassword({ email: AUTO_LOGIN_EMAIL, password: AUTO_LOGIN_PASSWORD }));
  }
  const ok = !error;
  recordAutoLoginOutcome(ok);
  return ok;
}
