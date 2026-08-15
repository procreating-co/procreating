import type { Metadata } from "next";
import { Clapperboard, Clock, PackageCheck } from "lucide-react";
import { StatTile } from "@/components/dashboard/stat-tile";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProductionItemsTable } from "@/components/operacao/production-items-table";
import { listProductionItems } from "@/lib/operacao/queries";
import { listClients } from "@/lib/clientes/queries";

export const metadata: Metadata = {
  title: "Produção — Procreating",
  robots: { index: false, follow: false },
};

/**
 * Real (troca `DEMO_PRODUCTIONS`, `lib/dashboard/demo-data.ts`) — `production_items` filtrado por
 * `kind='producao'` (migration `20260814300000_production_items.sql`). Mesma tabela de Entregas/
 * Recursos, cada página só filtra e rotula diferente — ver `ProductionItemsTable`.
 */
export default async function ProducaoPage() {
  const [items, clients] = await Promise.all([listProductionItems("producao"), listClients()]);
  const activeCount = items.filter((item) => item.status_tone === "active").length;
  const pendingCount = items.filter((item) => item.status_tone === "pending").length;

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 pt-8 pb-16 lg:px-10">
      <PageHeader title="Produção" description="Controle de conteúdos em produção." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile demo={false} label="Em produção" value={String(activeCount)} icon={<Clapperboard className="size-4.5" />} tone="brand" />
        <StatTile demo={false} label="Em roteiro/revisão" value={String(pendingCount)} icon={<Clock className="size-4.5" />} tone="warning" />
        <StatTile demo={false} label="Total de conteúdos" value={String(items.length)} icon={<PackageCheck className="size-4.5" />} tone="info" />
      </div>

      <ProductionItemsTable kind="producao" items={items} clients={clients} />
    </main>
  );
}
