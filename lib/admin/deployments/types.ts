/**
 * Deployment — mock só do admin (`lib/admin/**`), inspirado no tipo `Deployment` já congelado
 * em `lib/supabase/types/database.ts` (não importa de lá — a mesma separação já adotada em
 * `lib/admin/previews/types.ts`: demonstrar o fluxo sem mexer no domínio congelado). Só o
 * target "production" e o status "succeeded" existem aqui — esta etapa é só "Publicação", sem
 * pipeline assíncrono real (pending/in_progress/failed ficam pro dia em que o deploy for de
 * verdade, ver docs/project-creation.md seção 12).
 */
export type AdminDeployment = {
  id: string;
  projectId: string;
  target: "production";
  status: "succeeded";
  triggeredBy: string;
  /** ISO 8601 */
  startedAt: string;
  /** ISO 8601 */
  finishedAt: string;
};
