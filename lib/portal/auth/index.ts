import { supabasePortalAuthProvider } from "@/lib/portal/auth/provider";
import type { PortalAuthProvider } from "@/lib/portal/auth/types";

export type { PortalUser, PortalSession, PortalSignInResult, PortalAuthProvider } from "@/lib/portal/auth/types";
export { PORTAL_SESSION_COOKIE, PORTAL_LOGIN_PATH, PORTAL_SIGNUP_PATH } from "@/lib/portal/auth/constants";

/** Mesma forma de `lib/admin/auth/index.ts` — troca de implementação é sempre esta linha só. */
const portalAuthProvider: PortalAuthProvider = supabasePortalAuthProvider;

export const getPortalSession = portalAuthProvider.getSession;
export const portalSignIn = portalAuthProvider.signIn;
export const portalSignOut = portalAuthProvider.signOut;
