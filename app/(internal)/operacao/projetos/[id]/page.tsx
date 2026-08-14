import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PackageCheck } from "lucide-react";
import { getProductionProject } from "@/lib/operacao/queries";
import { ProjectStatusSelect } from "@/components/operacao/project-status-select";
import { EmptyInline } from "@/components/dashboard/empty-inline";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const project = await getProductionProject(id);
  if (!project) return {};
  return { title: `${project.name} — Procreating`, robots: { index: false, follow: false } };
}

/** Produção/Entregas relacionadas ficam de fora — não têm tabela própria ainda (continuam mock em
 *  `/operacao/producao`/`/operacao/entregas`), fingir uma relação com `production_projects` real
 *  seria inventar dado. */
export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProductionProject(id);
  if (!project) notFound();

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 pt-8 pb-16 lg:px-10">
      <Link href="/operacao/projetos" className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-3.5" />
        Projetos
      </Link>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-3xl">{project.name}</h1>
        </div>
        <p className="text-sm text-muted-foreground">Cliente: {project.clientName}</p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Resumo</h2>
        <div className="grid grid-cols-2 gap-4 rounded-xl border border-border/60 bg-card/40 p-5 sm:grid-cols-4">
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-muted-foreground">Cliente</p>
            <p className="text-sm font-medium">{project.clientName}</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-muted-foreground">Responsável</p>
            <p className="text-sm font-medium">{project.assigneeName ?? "Sem responsável"}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">Status</p>
            <ProjectStatusSelect projectId={project.id} status={project.status} />
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-muted-foreground">Prazo</p>
            <p className="text-sm font-medium">{project.deadline ? dateFormatter.format(new Date(`${project.deadline}T00:00:00`)) : "Sem prazo definido"}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Produção e entregas</h2>
        <EmptyInline
          icon={PackageCheck}
          label="Ainda não existe uma tabela real de produção/entregas vinculada a projetos — essas telas continuam com dado de exemplo, sem relação com este projeto ainda."
        />
      </div>
    </main>
  );
}
