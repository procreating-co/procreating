import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/types/database";

/**
 * Client Supabase pro servidor (Server Components, Server Actions, Route Handlers) — lê/escreve
 * cookies de sessão via `next/headers`, seguindo o padrão oficial do Supabase pro App Router.
 * **Ninguém chama isto ainda.** Quando conectar de verdade, é aqui (e só aqui, do lado
 * servidor) que uma implementação real de `AuthProvider` (`lib/admin/auth/types.ts`) ou de
 * `ClientDataProvider` (`lib/clients/provider.ts`) baseada em Supabase se apoiaria.
 *
 * Requer `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` (ver `.env.example`).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Chamado a partir de um Server Component (não pode gravar cookie) — ignorável
          // quando há um proxy/middleware responsável por refrescar a sessão a cada request.
        }
      },
    },
  });
}
