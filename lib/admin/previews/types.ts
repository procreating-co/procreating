/**
 * Preview — mock só do admin (`lib/admin/**`), NÃO é o tipo `Preview`/tabela `previews`
 * desenhada em `docs/project-creation.md` (seção 3) — aquele continua deliberadamente fora de
 * `lib/supabase/types/database.ts` (domínio congelado, Architecture Freeze). Isto aqui é só a
 * mock local que demonstra o fluxo (gerar link → abrir → revogar) nesta etapa, do mesmo jeito
 * que `lib/storage/mock-provider.ts` mocka upload sem ser o schema real.
 */
export type PreviewStatus = "active" | "revoked";

export type AdminPreview = {
  token: string;
  projectId: string;
  createdBy: string;
  /** ISO 8601 */
  createdAt: string;
  /** ISO 8601 */
  expiresAt: string;
  status: PreviewStatus;
};
