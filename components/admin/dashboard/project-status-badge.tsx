import type { ProjectStatus } from "@/lib/admin/projects/types";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<ProjectStatus, string> = {
  online: "Online",
  development: "Em desenvolvimento",
  paused: "Pausado",
};

const STATUS_CLASSES: Record<ProjectStatus, string> = {
  online: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  development: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  paused: "border-border bg-foreground/5 text-muted-foreground",
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-xs", STATUS_CLASSES[status])}>
      {STATUS_LABEL[status]}
    </span>
  );
}
