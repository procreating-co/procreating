import "server-only";
import { createClient } from "@/lib/supabase/server";

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
  return user?.id ?? null;
}
