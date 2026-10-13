import "server-only";
import { createClient } from "@/lib/supabase/server";
import { performAutoLogin, PUBLIC_FALLBACK_USER } from "@/lib/admin/auth/auto-login";

/**
 * `auth.uid()` do lado do banco (usado dentro do RPC `close_lead_and_create_client`) não tem
 * equivalente direto numa query REST comum via `supabase-js` — os Server Actions que gravam
 * `actor_id`/`created_by`/`owner_id` fora de um RPC precisam buscar o usuário atual explicitamente.
 * Um só lugar pra isso em vez de repetir `supabase.auth.getUser()` em cada action.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  let {
    data: { user },
  } = await supabase.auth.getUser();

  // Painel público (login removido): mesmo fallback de `getSession()` — sem sessão, loga na conta
  // de serviço (owner). Cobre o primeiro render de um navegador novo, antes de o `proxy.ts` ter
  // persistido os cookies sb-*. Ver `lib/admin/auth/auto-login.ts`.
  if (!user) {
    if (await performAutoLogin(supabase)) {
      ({
        data: { user },
      } = await supabase.auth.getUser());
    }
  }
  // Sem sessão real e sem credencial configurada: modo "visitante" (ver `auto-login.ts`), pra o
  // painel nunca bloquear. Com a chave de serviço, `user` é real e isto não é usado.
  return user?.id ?? PUBLIC_FALLBACK_USER.id;
}
