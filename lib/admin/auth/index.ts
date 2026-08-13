import { supabaseAuthProvider } from "@/lib/admin/auth/supabase-provider";
import type { AuthProvider } from "@/lib/admin/auth/types";

export type { AdminUser, AdminRole, AuthSession, AuthProvider, SignInResult } from "@/lib/admin/auth/types";
export { ADMIN_SESSION_COOKIE, ADMIN_LOGIN_PATH, ADMIN_HOME_PATH } from "@/lib/admin/auth/constants";

/**
 * Fase 1 (Foundation): `mockAuthProvider` foi substituído por `supabaseAuthProvider` (Supabase
 * Auth real). `getSession`/`signIn`/`signOut` abaixo mantêm a assinatura de sempre — layouts,
 * Server Actions e `proxy.ts` não precisaram mudar por causa desta troca.
 */
const authProvider: AuthProvider = supabaseAuthProvider;

export const getSession = authProvider.getSession;
export const signIn = authProvider.signIn;
export const signOut = authProvider.signOut;
