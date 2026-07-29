import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { ProjectCard } from "@/components/admin/projects/project-card";
import { getMockClientById } from "@/lib/admin/clients/mock-data";
import { getMockProjectsByClient } from "@/lib/admin/projects/mock-data";
import { formatDateTime } from "@/lib/admin/format";

type Params = { id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const client = getMockClientById(id);
  return { title: client ? `${client.name} | Painel Procreating` : "Cliente não encontrado" };
}

export default async function AdminClienteDetalhePage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const client = getMockClientById(id);
  if (!client) notFound();

  const projects = getMockProjectsByClient(client.id);

  return (
    <main className="mx-auto max-w-[1400px] px-6 py-10 lg:px-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
            Cliente desde {formatDateTime(client.createdAt)}
          </p>
          <h1 className="mt-1 font-display text-3xl">{client.name}</h1>
        </div>
        <button
          type="button"
          disabled
          title="Em breve"
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-sm text-muted-foreground/50"
        >
          <Plus className="size-4" />
          Novo Projeto pra {client.name}
        </button>
      </header>

      <section>
        <h2 className="mb-4 font-display text-xl">Projetos</h2>
        {projects.length === 0 ? (
          <p className="rounded-lg border border-border/60 bg-card/40 px-5 py-10 text-center text-sm text-muted-foreground">
            Nenhum projeto ainda.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
