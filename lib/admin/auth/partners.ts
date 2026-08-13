/**
 * Allowlist de sócios — único lugar do projeto que decide quem pode se cadastrar em
 * `/admin/signup`. Fase 2-5 (Comercial/Onboarding/Financeiro): antes disso só existia o usuário
 * seedado manualmente (`supabase/seed-foundation.sql`); agora um segundo sócio (Eduardo) precisa
 * de um jeito de criar a própria conta sem alguém rodar SQL por ele — mas sem abrir cadastro pra
 * qualquer email.
 *
 * Comparação sempre case-insensitive (`isPartnerEmail`) — nunca espalhar essa lista ou essa
 * lógica em outro arquivo.
 */
export const PARTNER_ALLOWLIST: string[] = ["martins.santiago08@gmail.com", "edufraresso11@gmail.com"];

export function isPartnerEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return PARTNER_ALLOWLIST.some((allowed) => allowed.toLowerCase() === normalized);
}
