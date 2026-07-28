import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { ProjectCard } from "@/components/admin/projects/project-card";
import { mockProjects } from "@/lib/admin/projects/mock-data";

export const metadata: Metadata = { title: "Projetos | Painel Procreating" };

/**
 * "+ Novo Projeto" fica desabilitado até a Etapa 6 (modal completo de criação) existir — o
 * botão já está no lugar certo, com o rótulo certo, só sem comportamento ainda.
 */
export default function AdminProjetosPage() {
  return (
    <main className="mx-auto max-w-[1400px] px-6 py-10 lg:px-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">Todos os projetos</p>
          <h1 className="mt-1 font-display text-3xl">Projetos</h1>
        </div>
        <button
          type="button"
          disabled
          title="Em breve"
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-sm text-muted-foreground/50"
        >
          <Plus className="size-4" />
          Novo Projeto
        </button>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </section>
    </main>
  );
}
