import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { WorkspaceHeader } from "@/components/workspace/workspace-header";
import { WorkspaceNav } from "@/components/workspace/workspace-nav";
import { getClientWorkspace } from "@/lib/clients/workspace-registry";

type Params = { client: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { client: slug } = await params;
  const client = getClientWorkspace(slug);
  return { title: client ? `${client.name} Workspace | Procreating` : "Workspace não encontrado" };
}

/**
 * Workspace interno — não é a entrega pública (isso é `/clients/[client]/public/**`, movido pra
 * lá de propósito, intocado). Lookup hoje é `lib/clients/workspace-registry.ts` (mesma fonte do
 * Client Hub, `/clients`, e da própria página Overview) — quando um registry de clientes real
 * (Supabase) existir, é só aqui que troca.
 */
export default async function ClientWorkspaceLayout({ children, params }: { children: ReactNode; params: Promise<Params> }) {
  const { client: slug } = await params;
  const client = getClientWorkspace(slug);
  if (!client) notFound();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1000px] px-6 lg:px-10">
        <WorkspaceHeader client={client} />
        <WorkspaceNav slug={slug} />
        <main className="py-8">{children}</main>
      </div>
    </div>
  );
}
