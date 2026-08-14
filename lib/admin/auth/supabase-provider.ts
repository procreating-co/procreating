import "server-only";
import { createClient } from "@/lib/supabase/server";
import { clearAdminSessionCookie, setAdminSessionCookie } from "@/lib/admin/auth/session-cookie";
import type { AdminUser, AuthProvider, AuthSession, SignInResult } from "@/lib/admin/auth/types";

/**
 * Implementação real do `AuthProvider` via Supabase Auth — substitui `mock-provider.ts`
 * (Fase 1, Foundation). Primeiro call site de `lib/supabase/server.ts` no projeto inteiro.
 *
 * `ADMIN_SESSION_COOKIE` continua existindo, mas muda de papel: não é mais quem decide se a
 * sessão é válida (isso agora é o Supabase Auth, via `getUser()` abaixo, que revalida o token
 * contra o servidor a cada chamada — não confia num cookie decodificado localmente). Ele existe
 * só como sinal rápido pro `proxy.ts` (checagem de borda, sem I/O) redirecionar cedo quem
 * claramente não tem sessão; a validação de verdade sempre acontece aqui.
 */
export const supabaseAuthProvider: AuthProvider = {
  async getSession(): Promise<AuthSession> {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    // Todo usuário do ERP precisa de uma linha em `public.users` (name/role) além da conta em
    // `auth.users` — provisionada hoje via `supabase/seed-foundation.sql`. Sem ela, tratamos
    // como sessão inválida em vez de inventar um perfil: role indefinido não deveria acessar
    // nada do painel.
    const { data: profile } = await supabase.from("users").select("id, name, email, role, theme, avatar_url").eq("id", user.id).single();
    if (!profile) return null;

    const adminUser: AdminUser = { id: profile.id, name: profile.name, email: profile.email, role: profile.role, theme: profile.theme, avatarUrl: profile.avatar_url };
    return { user: adminUser };
  },

  async signIn(email: string, password: string): Promise<SignInResult> {
    if (!email.trim() || !password.trim()) {
      return { ok: false, error: "Preencha e-mail e senha." };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { ok: false, error: "E-mail ou senha incorretos." };
    }

    // Sinal rápido pro proxy.ts (ver comentário acima) — o Supabase Auth já gravou seus
    // próprios cookies de sessão nesta mesma resposta, via `lib/supabase/server.ts`.
    await setAdminSessionCookie();

    return { ok: true };
  },

  async signOut(): Promise<void> {
    const supabase = await createClient();
    await supabase.auth.signOut();
    await clearAdminSessionCookie();
  },
};
