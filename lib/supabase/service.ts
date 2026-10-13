import "server-only";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types/database";

/**
 * Client Supabase com a chave de SERVIÇO (service_role) — só servidor, NUNCA exposto ao navegador
 * (a env var não tem prefixo `NEXT_PUBLIC_`). Usado exclusivamente pelo auto-login do painel
 * público (`lib/admin/auth/auto-login.ts`) pra PROVISIONAR a conta de serviço owner (criar +
 * confirmar e-mail + garantir a linha em `public.users`) sem depender de nenhum passo manual no
 * Supabase. Não é usado pelas queries normais do app — essas continuam passando por uma sessão
 * autenticada de verdade, com o RLS intacto.
 */
export function serviceRoleConfigured(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function createServiceClient(): SupabaseClient<Database> {
  return createSupabaseClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
