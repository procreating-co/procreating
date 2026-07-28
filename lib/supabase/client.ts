import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types/database";

/**
 * Client Supabase pro navegador ("use client"). **Ninguém chama isto ainda** — existe só como
 * arquitetura pronta pra Etapa em que o Supabase for conectado de verdade. Requer
 * `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` (ver `.env.example`); sem eles,
 * chamar esta função lança erro — por enquanto isso nunca acontece porque nada a importa.
 */
export function createClient() {
  return createBrowserClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}
