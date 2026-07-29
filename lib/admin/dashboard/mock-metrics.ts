export type DashboardMetricKey =
  | "activeProjects"
  | "publishedProjects"
  | "draftProjects"
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
 * Dados mockados — a Etapa de conectar Supabase + Analytics é onde isso vira uma agregação
 * real. A chave (`key`) é o que liga cada métrica ao ícone certo em `metric-icons.ts` — mudar o
 * texto do `label`/`value` aqui não quebra nada lá. `publishedProjects`/`draftProjects`/
 * `totalViews`/`totalDownloads` batem com a soma real de `mockProjects`
 * (`lib/admin/projects/mock-data.ts`) — os outros (`storageUsed`/`lastDeploy`/`lastUpload`) são
 * decorativos, sem fonte pra derivar ainda.
 */
export const mockDashboardMetrics: DashboardMetric[] = [
  { key: "activeProjects", label: "Projetos Ativos", value: "4", hint: "+1 este mês" },
  { key: "publishedProjects", label: "Projetos Publicados", value: "1" },
  { key: "draftProjects", label: "Projetos em Rascunho", value: "2" },
  { key: "totalViews", label: "Total de Visualizações", value: "13.866" },
  { key: "totalDownloads", label: "Total de Downloads", value: "1.101" },
  { key: "storageUsed", label: "Espaço Utilizado", value: "2,4 GB", hint: "de 10 GB" },
  { key: "lastDeploy", label: "Último Deploy", value: "há 2 horas" },
  { key: "lastUpload", label: "Último Upload", value: "há 5 horas" },
];
