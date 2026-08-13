/**
 * Tipos da autenticação administrativa — implementados por `supabase-provider.ts` (Fase 1,
 * Foundation) via Supabase Auth. Mesma ideia do `ClientDataProvider` em
 * `lib/clients/provider.ts`: o contrato fica estável, só a implementação por trás muda.
 */

import type { UserRole } from "@/lib/supabase/types/database";

/** Vocabulário de papel único da plataforma — ver `lib/supabase/types/database.ts` (`UserRole`,
 *  o mesmo valor gravado em `public.users.role`). Não redeclare uma lista de papéis paralela em
 *  outro lugar do código; `lib/dashboard/roles.ts` reexporta este tipo pelo mesmo motivo. */
export type AdminRole = UserRole;

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
