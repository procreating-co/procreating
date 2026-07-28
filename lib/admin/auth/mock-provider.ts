import "server-only";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/auth/constants";
import type { AdminUser, AuthProvider, AuthSession, SignInResult } from "@/lib/admin/auth/types";

/**
 * Implementação MOCK e TEMPORÁRIA do `AuthProvider` — qualquer email/senha não vazios "loga"
 * como o mesmo usuário fixo, gravando um cookie simples (sem JWT, sem assinatura, sem
 * verificação de senha real). Existe só pra destravar o desenvolvimento da UI do admin antes
 * do Supabase Auth estar conectado (ver `docs/supabase.md`).
 *
 * **Não é seguro.** Trocar por uma implementação real de `AuthProvider` (Supabase Auth) antes
 * de expor este painel fora do ambiente de desenvolvimento.
 */
const MOCK_USER: AdminUser = {
  id: "mock-user-1",
  name: "Equipe Procreating",
  email: "equipe@procreating.co",
  role: "admin",
};

export const mockAuthProvider: AuthProvider = {
  async getSession(): Promise<AuthSession> {
    const store = await cookies();
    return store.has(ADMIN_SESSION_COOKIE) ? { user: MOCK_USER } : null;
  },

  async signIn(email: string, password: string): Promise<SignInResult> {
    if (!email.trim() || !password.trim()) {
      return { ok: false, error: "Preencha e-mail e senha." };
    }
    const store = await cookies();
    store.set(ADMIN_SESSION_COOKIE, "mock", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8h — só pra não persistir indefinidamente durante o desenvolvimento
    });
    return { ok: true };
  },

  async signOut(): Promise<void> {
    const store = await cookies();
    store.delete(ADMIN_SESSION_COOKIE);
  },
};
