import { mockAuthProvider } from "@/lib/admin/auth/mock-provider";
import type { AuthProvider } from "@/lib/admin/auth/types";

export type { AdminUser, AdminRole, AuthSession, AuthProvider, SignInResult } from "@/lib/admin/auth/types";
export { ADMIN_SESSION_COOKIE, ADMIN_LOGIN_PATH, ADMIN_HOME_PATH } from "@/lib/admin/auth/constants";

/**
 * Única linha que muda quando o Supabase Auth entrar: trocar `mockAuthProvider` por um
 * provider real que satisfaça a mesma interface `AuthProvider`. `getSession`/`signIn`/
 * `signOut` abaixo mantêm a assinatura — layouts, Server Actions e o middleware nunca
 * precisam mudar.
 */
const authProvider: AuthProvider = mockAuthProvider;

export const getSession = authProvider.getSession;
export const signIn = authProvider.signIn;
export const signOut = authProvider.signOut;
