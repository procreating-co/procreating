import type { Metadata } from "next";
import Link from "next/link";
import { Handshake, PackageCheck, Target, TrendingUp, UserPlus, Wallet } from "lucide-react";
import { computeComercialMetrics, compareStrategies } from "@/lib/comercial/metrics";
import { StatTile } from "@/components/dashboard/stat-tile";
import { PageHeader } from "@/components/dashboard/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = {
  title: "Comercial — Procreating",
  robots: { index: false, follow: false },
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default async function ComercialPage() {
  const [metrics, comparison] = await Promise.all([computeComercialMetrics(), compareStrategies()]);

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 pt-8 pb-16 lg:px-10">
      <PageHeader title="Comercial" description="Métricas do funil e comparação entre estratégias." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatTile demo={false} label="Leads abertos" value={String(metrics.openLeads)} icon={<UserPlus className="size-4.5" />} />
        <StatTile demo={false} label="Novos este mês" value={String(metrics.newLeadsThisMonth)} icon={<Target className="size-4.5" />} />
        <StatTile demo={false} label="Em negociação" value={String(metrics.inNegotiation)} icon={<Handshake className="size-4.5" />} />
        <StatTile demo={false} label="Fechados este mês" value={String(metrics.closedThisMonth)} icon={<PackageCheck className="size-4.5" />} />
        <StatTile demo={false} label="Pipeline em aberto" value={currencyFormatter.format(metrics.pipelineValue)} icon={<Wallet className="size-4.5" />} />
        <StatTile
          demo={false}
          label="Conversão lead → fechado"
          value={metrics.conversionRate != null ? `${(metrics.conversionRate * 100).toFixed(0)}%` : "—"}
          icon={<TrendingUp className="size-4.5" />}
        />
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Comparação entre estratégias</h2>
        {comparison.length === 0 ? (
          <div className="rounded-xl border border-border/60 bg-card/20 px-6 py-16 text-center text-muted-foreground">Nenhuma estratégia cadastrada ainda.</div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/60">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead>Estratégia</TableHead>
                  <TableHead>Leads</TableHead>
                  <TableHead>Fechados</TableHead>
                  <TableHead>Ticket médio</TableHead>
                  <TableHead>Receita total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparison.map((row) => (
                  <TableRow key={row.strategy.id} className="border-border/60">
                    <TableCell className="font-medium">
                      <Link href={`/comercial/estrategias/${row.strategy.id}`} className="hover:underline">
                        {row.strategy.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{row.totalLeads}</TableCell>
                    <TableCell className="text-muted-foreground">{row.wonLeads}</TableCell>
                    <TableCell className="text-muted-foreground">{row.averageTicket != null ? currencyFormatter.format(row.averageTicket) : "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{currencyFormatter.format(row.totalRevenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </main>
  );
}
