/**
 * Tipos da autenticação administrativa. Hoje implementados por um provider mock
 * (`mock-provider.ts`), amanhã por um provider que fala com o Supabase Auth — mesma ideia do
 * `ClientDataProvider` em `lib/clients/provider.ts`: o contrato fica estável, só a
 * implementação por trás muda.
 */

export type AdminRole = "admin" | "editor";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
};

/** `null` quando não há sessão ativa. */
export type AuthSession = { user: AdminUser } | null;

export type SignInResult = { ok: true } | { ok: false; error: string };

export interface AuthProvider {
  /** Lê a sessão atual a partir do cookie de sessão (server-side apenas). */
  getSession(): Promise<AuthSession>;
  /** Autentica e, se bem-sucedido, grava o cookie de sessão. */
  signIn(email: string, password: string): Promise<SignInResult>;
  /** Encerra a sessão atual (limpa o cookie). */
  signOut(): Promise<void>;
}
