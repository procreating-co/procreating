import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCheck, Clock, PackageCheck } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { StatTile } from "@/components/dashboard/stat-tile";
import { StatusDot, type StatusTone } from "@/components/dashboard/status-dot";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = {
  title: "Entregas — Procreating",
  robots: { index: false, follow: false },
};

/** Indicadores mockados — sem backend ainda, por isso o `StatTile` carrega a etiqueta "Demo". */
const STATS = [
  { key: "semana", label: "Entregas esta semana", value: "5", icon: PackageCheck },
  { key: "aprovacao", label: "Aguardando aprovação", value: "2", icon: Clock },
  { key: "entregues", label: "Entregues", value: "9", icon: CheckCheck },
];

/** Listagem mockada — mesma ressalva do `STATS`, sem CRUD nem dados reais ainda. */
const DEMO_DELIVERIES: { title: string; client: string; status: string; tone: StatusTone }[] = [
  { title: "Landing Page Pascoal", client: "Pascoal", status: "Aguardando aprovação", tone: "pending" },
  { title: "Apresentação Dra. Elenita", client: "Dra. Elenita", status: "Em revisão", tone: "active" },
];

export default function EntregasPage() {
  return (
    <DashboardLayout>
      <main className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 py-16 lg:px-10">
        <Link
          href="/operacao"
          className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Operação
        </Link>

        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl">Entregas</h1>
          <p className="max-w-lg text-sm text-muted-foreground">Controle de entregas e prazos dos clientes.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STATS.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <StatTile
                key={stat.key}
                label={stat.label}
                value={stat.value}
                icon={<Icon className="size-4.5" />}
                delay={index * 0.05}
              />
            );
          })}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Entregas em andamento</h2>
            <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              Demo
            </span>
          </div>
          <div className="overflow-hidden rounded-xl border border-border/60">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead>Entrega</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DEMO_DELIVERIES.map((item) => (
                  <TableRow key={item.title} className="border-border/60">
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell className="text-muted-foreground">{item.client}</TableCell>
                    <TableCell>
                      <StatusDot tone={item.tone} label={item.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
