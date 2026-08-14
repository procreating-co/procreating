"use client";

import { useState } from "react";
import Link from "next/link";
import { FolderKanban, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/dashboard/status-dot";
import { EmptyInline } from "@/components/dashboard/empty-inline";
import { ProjectFormDialog } from "@/components/operacao/project-form-dialog";
import { PRODUCTION_PROJECT_STATUS_LABEL, PRODUCTION_PROJECT_STATUS_TONE } from "@/lib/operacao/types";
import type { ProductionProjectWithRelations } from "@/lib/operacao/queries";
import type { Client, User } from "@/lib/supabase/types/database";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

export function ProjectsGrid({ projects, clients, users }: { projects: ProductionProjectWithRelations[]; clients: Client[]; users: User[] }) {
  const [creating, setCreating] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Projetos</h2>
        <Button type="button" size="sm" onClick={() => setCreating(true)} className="gap-1.5">
          <Plus className="size-3.5" />
          Novo projeto
        </Button>
      </div>

      {projects.length === 0 ? (
        <EmptyInline icon={FolderKanban} label="Nenhum projeto ainda — crie o primeiro acima." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/operacao/projetos/${project.id}`}
              className="group flex flex-col gap-4 rounded-xl border border-border/60 bg-card/40 p-5 transition-colors hover:border-border hover:bg-card/70"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-medium">{project.name}</h3>
                <StatusDot tone={PRODUCTION_PROJECT_STATUS_TONE[project.status]} label={PRODUCTION_PROJECT_STATUS_LABEL[project.status]} />
              </div>
              <p className="text-sm text-muted-foreground">Cliente: {project.clientName}</p>
              <div className="flex items-center justify-between border-t border-border/60 pt-4 text-sm">
                <span className="text-muted-foreground">Responsável: {project.assigneeName ?? "—"}</span>
                <span className="text-muted-foreground">{project.deadline ? dateFormatter.format(new Date(`${project.deadline}T00:00:00`)) : "Sem prazo"}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <ProjectFormDialog open={creating} onOpenChange={setCreating} clients={clients} users={users} />
    </div>
  );
}
