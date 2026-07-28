import { ExternalLink, Pencil } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProjectStatusBadge } from "@/components/admin/dashboard/project-status-badge";
import { formatDateTime } from "@/lib/admin/format";
import type { AdminProject } from "@/lib/admin/projects/types";

/**
 * "Ações" ainda não faz nada — abrir/editar um projeto de verdade depende das Etapas 5/6
 * (rota `/admin/projetos` e o fluxo de edição). Os botões ficam visíveis e desabilitados em
 * vez de omitidos, pra já comunicar o formato final da tabela.
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
              <TableCell className="font-medium">{project.name}</TableCell>
              <TableCell>
                <ProjectStatusBadge status={project.status} />
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDateTime(project.lastAccessAt)}</TableCell>
              <TableCell className="text-muted-foreground">{formatDateTime(project.updatedAt)}</TableCell>
              <TableCell className="text-muted-foreground">{project.clientName}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <button type="button" disabled title="Em breve" className="rounded-md p-1.5 text-muted-foreground/50 cursor-not-allowed">
                    <ExternalLink className="size-4" />
                  </button>
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
