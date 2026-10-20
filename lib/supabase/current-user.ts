import "server-only";
import { createClient } from "@/lib/supabase/server";
import { PUBLIC_FALLBACK_USER } from "@/lib/admin/auth/auto-login";

/**
 * `auth.uid()` do lado do banco (usado dentro do RPC `close_lead_and_create_client`) não tem
 * equivalente direto numa query REST comum via `supabase-js` — os Server Actions que gravam
 * `actor_id`/`created_by`/`owner_id` fora de um RPC precisam buscar o usuário atual explicitamente.
 * Um só lugar pra isso em vez de repetir `supabase.auth.getUser()` em cada action.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // NÃO dispara auto-login aqui (era custo duplicado por página, fonte da lentidão). Quando a
  // sessão real existe (cookie já persistido pelo `proxy.ts`/`getSession`), `user` vem preenchido;
  // senão, cai no id do visitante — o painel nunca bloqueia. Ver `lib/admin/auth/auto-login.ts`.
  return user?.id ?? PUBLIC_FALLBACK_USER.id;
}
