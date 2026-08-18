"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, FolderKanban, Plus } from "lucide-react";
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
          {/* `relative` + link "esticado" (`absolute inset-0`) pro card inteiro continuar
           *  clicável pro detalhe do projeto, sem aninhar `<a>` dentro de `<a>` (inválido em
           *  HTML) — o botão "Ver cliente" fica `relative z-10`, por cima do link esticado, com
           *  a própria área de clique. */}
          {projects.map((project) => (
            <div key={project.id} className="group relative flex flex-col gap-4 rounded-xl border border-border/60 bg-card/40 p-5 transition-colors hover:border-border hover:bg-card/70">
              <Link href={`/operacao/projetos/${project.id}`} className="absolute inset-0" aria-label={`Abrir projeto ${project.name}`} />
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-medium">{project.name}</h3>
                <StatusDot tone={PRODUCTION_PROJECT_STATUS_TONE[project.status]} label={PRODUCTION_PROJECT_STATUS_LABEL[project.status]} />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Cliente: {project.clientName}</span>
                {/* Pedido explícito — botão pra página do cliente ao lado do nome, mesmo a
                 *  página em si (`/clientes/[id]`) ainda não ter tudo que vai ter no futuro. */}
                <Link
                  href={`/clientes/${project.client_id}`}
                  className="relative z-10 flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs text-foreground/70 underline-offset-2 transition-colors hover:bg-foreground/5 hover:text-foreground hover:underline"
                >
                  Ver cliente
                  <ArrowUpRight className="size-3" />
                </Link>
              </div>
              <div className="flex items-center justify-between border-t border-border/60 pt-4 text-sm">
                <span className="text-muted-foreground">Responsável: {project.assigneeName ?? "—"}</span>
                <span className="text-muted-foreground">{project.deadline ? dateFormatter.format(new Date(`${project.deadline}T00:00:00`)) : "Sem prazo"}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProjectFormDialog open={creating} onOpenChange={setCreating} clients={clients} users={users} />
    </div>
  );
}
