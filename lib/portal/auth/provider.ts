import "server-only";
import { createClient } from "@/lib/supabase/server";
import { clearPortalSessionCookie, setPortalSessionCookie } from "@/lib/portal/auth/session-cookie";
import type { PortalAuthProvider, PortalSession, PortalSignInResult, PortalUser } from "@/lib/portal/auth/types";

/**
 * Implementação real do `PortalAuthProvider` via Supabase Auth — mesma instância/projeto que
 * `lib/admin/auth/supabase-provider.ts` usa (não existe um segundo Supabase Auth). O cookie real
 * de sessão (`@supabase/ssr`, nome fixo por projeto) é o mesmo dos dois lados — é por isso que um
 * navegador só consegue estar logado como staff OU como cliente por vez, nunca os dois ao mesmo
 * tempo, exatamente como qualquer app de conta única (esperado, não é uma falha de isolamento:
 * quem decide se um `auth.uid()` é staff ou cliente é sempre `getSession()`/`getPortalSession()`
 * consultando a tabela certa, nunca o cookie em si).
 *
 * `PORTAL_SESSION_COOKIE` é só o sinal rápido pro `proxy.ts` — a validação de verdade é
 * `getSession()` abaixo, que resolve `get_my_portal_client()` (Fase B1) a cada chamada.
 */
export const supabasePortalAuthProvider: PortalAuthProvider = {
  async getSession(): Promise<PortalSession> {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    // Se `auth.uid()` for um membro de equipe (sessão de staff aberta nesta mesma aba, por
    // exemplo), `get_my_portal_client()` devolve 0 linhas — não existe vínculo em
    // `client_portal_users` pra staff, por desenho da Fase A. Tratado como "sem sessão de
    // Portal", nunca inventamos um perfil.
    const { data } = await supabase.rpc("get_my_portal_client");
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return null;

    const portalUser: PortalUser = { id: user.id, clientId: row.id, clientName: row.name, clientSlug: row.slug, clientStatus: row.status };
    return { user: portalUser };
  },

  async signIn(email: string, password: string): Promise<PortalSignInResult> {
    if (!email.trim() || !password.trim()) {
      return { ok: false, error: "Preencha e-mail e senha." };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { ok: false, error: "E-mail ou senha incorretos." };
    }

    const { data } = await supabase.rpc("get_my_portal_client");
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      // Autenticou com sucesso no Supabase Auth, mas não tem vínculo de Portal ativo — não deixa
      // entrar (ex.: alguém de equipe tentando logar aqui por engano, ou vínculo desativado).
      await supabase.auth.signOut();
      return { ok: false, error: "Esta conta não tem acesso ao Portal." };
    }

    await setPortalSessionCookie();
    return { ok: true, slug: row.slug };
  },

  async signOut(): Promise<void> {
    const supabase = await createClient();
    await supabase.auth.signOut();
    await clearPortalSessionCookie();
  },
};
