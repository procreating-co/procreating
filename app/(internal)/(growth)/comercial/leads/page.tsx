import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listOpenLeads, listPipelineStages, listStrategies } from "@/lib/comercial/queries";
import { listUsers } from "@/lib/admin/users/queries";
import { LeadsTable } from "@/components/comercial/leads-table";

export const metadata: Metadata = {
  title: "Leads — Procreating",
  robots: { index: false, follow: false },
};

export default async function LeadsPage() {
  const [leads, stages, strategies, users] = await Promise.all([listOpenLeads(), listPipelineStages(), listStrategies(), listUsers()]);

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 py-16 lg:px-10">
      <Link href="/comercial" className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-3.5" />
        Comercial
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl">Leads</h1>
        <p className="max-w-lg text-sm text-muted-foreground">Todos os leads em aberto — clique numa linha pra ver/editar o detalhe.</p>
      </div>

      <LeadsTable leads={leads} stages={stages} strategies={strategies} users={users} />
    </main>
  );
}
