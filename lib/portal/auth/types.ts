/**
 * Tipos da autenticação do Portal — mesma ideia de `lib/admin/auth/types.ts`
 * (`AuthProvider`/`AdminUser`), mas o "usuário" aqui é um cliente, não um membro de equipe.
 * `clientId`/`clientSlug` vêm de `get_my_portal_client()` (Fase B1) — nunca de um parâmetro que
 * o chamador possa forjar, sempre resolvido a partir de `auth.uid()` no banco.
 */

export type PortalUser = {
  id: string;
  clientId: string;
  clientName: string;
  clientSlug: string;
  clientStatus: string;
};

/** `null` quando não há sessão ativa, ou quando `auth.uid()` não tem vínculo de Portal ativo
 *  (ex.: um membro de equipe logado por engano nesta rota nunca vira um `PortalUser`). */
export type PortalSession = { user: PortalUser } | null;

export type PortalSignInResult = { ok: true; slug: string } | { ok: false; error: string };

export interface PortalAuthProvider {
  getSession(): Promise<PortalSession>;
  signIn(email: string, password: string): Promise<PortalSignInResult>;
  signOut(): Promise<void>;
}
