import type { Metadata } from "next";
import { Calendar, Clapperboard, Send } from "lucide-react";
import { StatTile } from "@/components/dashboard/stat-tile";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProductionItemsTable } from "@/components/operacao/production-items-table";
import { listProductionItems } from "@/lib/operacao/queries";
import { listClients } from "@/lib/clientes/queries";

export const metadata: Metadata = {
  title: "Conteúdo — Procreating",
  robots: { index: false, follow: false },
};

/** Real (troca o array `DEMO_CONTENT` que vivia direto no componente) — `production_items`
 *  filtrado por `kind='conteudo'`. */
export default async function ConteudoPage() {
  const [items, clients] = await Promise.all([listProductionItems("conteudo"), listClients()]);
  const planned = items.filter((item) => item.status_tone === "pending").length;
  const inProduction = items.filter((item) => item.status_tone === "active").length;

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 pt-8 pb-16 lg:px-10">
      <PageHeader title="Conteúdo" description="Controle dos conteúdos produzidos." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile demo={false} label="Planejados" value={String(planned)} icon={<Calendar className="size-4.5" />} tone="warning" />
        <StatTile demo={false} label="Em produção" value={String(inProduction)} icon={<Clapperboard className="size-4.5" />} tone="brand" />
        <StatTile demo={false} label="Total de conteúdos" value={String(items.length)} icon={<Send className="size-4.5" />} tone="info" />
      </div>

      <ProductionItemsTable kind="conteudo" items={items} clients={clients} />
    </main>
  );
}
