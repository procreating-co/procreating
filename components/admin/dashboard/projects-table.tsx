import { ExternalLink, Pencil } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProjectStatusBadge } from "@/components/admin/dashboard/project-status-badge";
import { formatDateTime } from "@/lib/admin/format";
import { getMockClientName } from "@/lib/admin/clients/mock-data";
import type { AdminProject } from "@/lib/admin/projects/types";

/**
 * "Abrir" (ícone externo) já é um link real pro site público (`/clients/<slug>`), igual ao
 * `ProjectCard`. "Editar" fica desabilitado — o fluxo de edição ainda não existe.
 */
export function ProjectsTable({ projects }: { projects: AdminProject[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border/60">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Nome</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Último acesso</TableHead>
            <TableHead>Atualizado em</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="font-medium">
                <a href={`/admin/projetos/${project.id}`} className="hover:underline">
                  {project.name}
                </a>
              </TableCell>
              <TableCell>
                <ProjectStatusBadge status={project.status} />
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDateTime(project.lastAccessAt)}</TableCell>
              <TableCell className="text-muted-foreground">{formatDateTime(project.updatedAt)}</TableCell>
              <TableCell className="text-muted-foreground">
                <a href={`/admin/clientes/${project.clientId}`} className="hover:underline">
                  {getMockClientName(project.clientId)}
                </a>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <a
                    href={`/clients/${project.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Abrir site público"
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
                  >
                    <ExternalLink className="size-4" />
                  </a>
                  <button type="button" disabled title="Em breve" className="rounded-md p-1.5 text-muted-foreground/50 cursor-not-allowed">
                    <Pencil className="size-4" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
