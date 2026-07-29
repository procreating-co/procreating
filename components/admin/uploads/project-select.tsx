"use client";

import { usePathname, useRouter } from "next/navigation";
import type { AdminProject } from "@/lib/admin/projects/types";

/** Troca o projeto selecionado via `?project=` — a leitura de arquivos acontece no Server Component da página. */
export function ProjectSelect({ projects, selectedSlug }: { projects: AdminProject[]; selectedSlug: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select
      value={selectedSlug}
      onChange={(e) => router.push(`${pathname}?project=${e.target.value}`)}
      aria-label="Selecionar projeto"
      className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      {projects.map((project) => (
        <option key={project.id} value={project.slug}>
          {project.name}
        </option>
      ))}
    </select>
  );
}
