export type DashboardMetricKey =
  | "activeProjects"
  | "onlineProjects"
  | "developmentProjects"
  | "totalViews"
  | "totalDownloads"
  | "storageUsed"
  | "lastDeploy"
  | "lastUpload";

export type DashboardMetric = {
  key: DashboardMetricKey;
  label: string;
  value: string;
  hint?: string;
};

/**
 * Dados mockados — Etapa 3/8 (Supabase + Analytics) é onde isso vira uma agregação real.
 * A chave (`key`) é o que liga cada métrica ao ícone certo em `metric-icons.ts` — mudar o
 * texto do `label`/`value` aqui não quebra nada lá.
 */
export const mockDashboardMetrics: DashboardMetric[] = [
  { key: "activeProjects", label: "Projetos Ativos", value: "4", hint: "+1 este mês" },
  { key: "onlineProjects", label: "Projetos Online", value: "3" },
  { key: "developmentProjects", label: "Projetos em Desenvolvimento", value: "1" },
  { key: "totalViews", label: "Total de Visualizações", value: "12.480" },
  { key: "totalDownloads", label: "Total de Downloads", value: "1.032" },
  { key: "storageUsed", label: "Espaço Utilizado", value: "2,4 GB", hint: "de 10 GB" },
  { key: "lastDeploy", label: "Último Deploy", value: "há 2 horas" },
  { key: "lastUpload", label: "Último Upload", value: "há 5 horas" },
];
