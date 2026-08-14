import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listOpenLeads, listPipelineStages } from "@/lib/comercial/queries";
import { listUsers } from "@/lib/admin/users/queries";
import { PipelineBoard } from "@/components/comercial/pipeline-board";

export const metadata: Metadata = {
  title: "Pipeline — Procreating",
  robots: { index: false, follow: false },
};

export default async function PipelinePage() {
  const [leads, stages, users] = await Promise.all([listOpenLeads(), listPipelineStages(), listUsers()]);

  return (
    <main className="mx-auto flex max-w-[1600px] flex-col gap-8 px-6 pt-8 pb-16 lg:px-10">
      <Link href="/comercial" className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-3.5" />
        Comercial
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl">Pipeline</h1>
        <p className="max-w-lg text-sm text-muted-foreground">Arraste um card pra mudar de estágio. Soltar em "Fechado" abre o onboarding do cliente.</p>
      </div>

      <PipelineBoard leads={leads} stages={stages} users={users} />
    </main>
  );
}
