import "server-only";
import { getSession } from "@/lib/admin/auth";
import type { UserRole } from "@/lib/supabase/types/database";

/**
 * RBAC mínimo (Passo 1 item 2 da retomada — pré-requisito documentado pro orquestrador de IA,
 * §73-74: nenhuma ferramenta de IA deve poder ver dado que o usuário logado não veria de outra
 * forma). Escopo desta primeira rodada: só "pode ver dado financeiro" — é o que já existe pra
 * proteger (`lib/financeiro/**`). Outros domínios (Comercial, Operação) ficam de fora até
 * existir um caso de uso real que peça, mesmo espírito de "não inventar abstração sem uso".
 *
 * `role` nunca é lido do cliente — sempre resolvido aqui via `getSession()` (a mesma fonte que
 * já autentica o painel inteiro, `lib/admin/auth`), nunca de um parâmetro que o chamador possa
 * forjar.
 */

const FINANCIAL_ROLES: ReadonlySet<UserRole> = new Set(["owner", "admin", "finance"]);

/** Pura — sem I/O — pra quem já tem o `role` em mãos (ex.: um Client Component com
 *  `useAdminUser()`) e só precisa da regra, sem outra ida ao servidor. */
export function canViewFinancials(role: UserRole): boolean {
  return FINANCIAL_ROLES.has(role);
}

/** Segundo domínio de RBAC (gestão de usuários — `/configuracoes/usuarios`) — quem pode ver
 *  papel de cada colega e revogar convite pendente. `owner`/`admin` apenas, mesmo espírito
 *  restrito do financeiro (dado sensível de quem tem acesso ao quê). */
const USER_MANAGEMENT_ROLES: ReadonlySet<UserRole> = new Set(["owner", "admin"]);

export function canManageUsers(role: UserRole): boolean {
  return USER_MANAGEMENT_ROLES.has(role);
}

export type PermissionResult = { ok: true; userId: string; role: UserRole } | { ok: false; error: string };

/** O que toda Server Action/query de `lib/financeiro/**` chama antes de ler ou escrever —
 *  resolve a sessão de verdade (nunca confia em nada vindo do chamador) e aplica
 *  `canViewFinancials` num passo só. */
export async function requireFinancialAccess(): Promise<PermissionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sessão expirada — faça login de novo." };
  if (!canViewFinancials(session.user.role)) {
    return { ok: false, error: "Você não tem permissão para acessar dados financeiros." };
  }
  return { ok: true, userId: session.user.id, role: session.user.role };
}

/** Mesmo padrão de `requireFinancialAccess` — resolve sessão real, nunca confia em `role`
 *  vindo do chamador. Usado por `/configuracoes/usuarios` e por `revokeInviteAction`. */
export async function requireUserManagementAccess(): Promise<PermissionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sessão expirada — faça login de novo." };
  if (!canManageUsers(session.user.role)) {
    return { ok: false, error: "Você não tem permissão para gerenciar usuários." };
  }
  return { ok: true, userId: session.user.id, role: session.user.role };
}
