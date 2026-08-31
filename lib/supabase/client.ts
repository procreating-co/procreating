import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types/database";

/**
 * Client Supabase pro navegador ("use client"). Primeiro uso real: `video-upload-field.tsx`
 * (upload de vídeo de Proposta) — precisa ir DIRETO do navegador pro Storage, nunca por Server
 * Action, cujo limite de payload de Function do Vercel (~4.5MB) é bem menor que um vídeo real.
 * A sessão (cookie) é a mesma do lado servidor (`lib/supabase/server.ts`, via `@supabase/ssr`),
 * então RLS/`is_active_staff()` se aplicam aqui exatamente como em qualquer chamada server-side.
 */
export function createClient() {
  return createBrowserClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}
