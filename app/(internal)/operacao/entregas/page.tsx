import type { Metadata } from "next";
import { CheckCheck, Clock, PackageCheck } from "lucide-react";
import { StatTile } from "@/components/dashboard/stat-tile";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProductionItemsTable } from "@/components/operacao/production-items-table";
import { listProductionItems } from "@/lib/operacao/queries";
import { listClients } from "@/lib/clientes/queries";

export const metadata: Metadata = {
  title: "Entregas — Procreating",
  robots: { index: false, follow: false },
};

/** Real (troca `DEMO_DELIVERIES`) — `production_items` filtrado por `kind='entrega'`. */
export default async function EntregasPage() {
  const [items, clients] = await Promise.all([listProductionItems("entrega"), listClients()]);
  const awaitingApproval = items.filter((item) => item.status_label === "Aguardando aprovação").length;
  const inReview = items.filter((item) => item.status_tone === "active").length;

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 pt-8 pb-16 lg:px-10">
      <PageHeader title="Entregas" description="Controle de entregas e prazos dos clientes." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile demo={false} label="Entregas em andamento" value={String(items.length)} icon={<PackageCheck className="size-4.5" />} tone="info" />
        <StatTile demo={false} label="Aguardando aprovação" value={String(awaitingApproval)} icon={<Clock className="size-4.5" />} tone="warning" />
        <StatTile demo={false} label="Em revisão" value={String(inReview)} icon={<CheckCheck className="size-4.5" />} tone="brand" />
      </div>

      <ProductionItemsTable kind="entrega" items={items} clients={clients} />
    </main>
  );
}
