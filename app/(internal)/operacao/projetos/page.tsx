import type { Metadata } from "next";
import { CheckCircle2, FolderKanban, Users } from "lucide-react";
import { StatTile } from "@/components/dashboard/stat-tile";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProjectsGrid } from "@/components/operacao/projects-grid";
import { listProductionProjects, listTeamUsers } from "@/lib/operacao/queries";
import { listClients } from "@/lib/clientes/queries";

export const metadata: Metadata = {
  title: "Projetos — Procreating",
  robots: { index: false, follow: false },
};

/**
 * Primeiro slice real da Operação — `production_projects` (migration
 * `20260814250000_production_projects.sql`), substitui `DEMO_PROJECTS`
 * (`lib/dashboard/demo-data.ts`). Produção/Entregas continuam mock (workflow próprio, fora desta
 * fase) — por isso "Produções relacionadas"/"Entregas relacionadas" não aparecem mais aqui: seria
 * fingir uma relação entre uma tabela real e dado mock.
 */
export default async function ProjetosPage() {
  const [projects, clients, users] = await Promise.all([listProductionProjects(), listClients(), listTeamUsers()]);

  const activeCount = projects.filter((p) => p.status !== "concluido").length;
  const distinctClients = new Set(projects.map((p) => p.client_id)).size;

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 pt-8 pb-16 lg:px-10">
      <PageHeader title="Projetos" description="Projetos de produção interna — vídeo, conteúdo, landing page — pros clientes já fechados." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile demo={false} label="Projetos ativos" value={String(activeCount)} icon={<FolderKanban className="size-4.5" />} />
        <StatTile demo={false} label="Clientes envolvidos" value={String(distinctClients)} icon={<Users className="size-4.5" />} />
        <StatTile demo={false} label="Concluídos" value={String(projects.length - activeCount)} icon={<CheckCircle2 className="size-4.5" />} />
      </div>

      <ProjectsGrid projects={projects} clients={clients} users={users} />
    </main>
  );
}
