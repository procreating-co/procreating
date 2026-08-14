import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCheck, Clock, PackageCheck } from "lucide-react";
import { StatTile } from "@/components/dashboard/stat-tile";
import { StatusDot } from "@/components/dashboard/status-dot";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DEMO_DELIVERIES, getClient, getProject } from "@/lib/dashboard/demo-data";

export const metadata: Metadata = {
  title: "Entregas — Procreating",
  robots: { index: false, follow: false },
};

/** Indicadores mockados — sem backend ainda, por isso o `StatTile` carrega a etiqueta "Demo".
 *  Derivados do próprio `DEMO_DELIVERIES` (antes eram literais que nem batiam com a tabela logo
 *  abaixo — ex. "9 entregues" quando nenhuma linha do mock tem esse status). */
const STATS = [
  { key: "total", label: "Entregas em andamento", value: String(DEMO_DELIVERIES.length), icon: PackageCheck },
  { key: "aprovacao", label: "Aguardando aprovação", value: String(DEMO_DELIVERIES.filter((item) => item.status === "Aguardando aprovação").length), icon: Clock },
  { key: "revisao", label: "Em revisão", value: String(DEMO_DELIVERIES.filter((item) => item.tone === "active").length), icon: CheckCheck },
];

export default function EntregasPage() {
  return (
      <main className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 pt-8 pb-16 lg:px-10">
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
                  <TableHead>Projeto</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DEMO_DELIVERIES.map((item) => {
                  const project = getProject(item.projectKey);
                  const client = project ? getClient(project.clientKey) : undefined;
                  return (
                    <TableRow key={item.key} className="border-border/60">
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell className="text-muted-foreground">{project?.name}</TableCell>
                      <TableCell className="text-muted-foreground">{client?.name}</TableCell>
                      <TableCell>
                        <StatusDot tone={item.tone} label={item.status} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
  );
}
