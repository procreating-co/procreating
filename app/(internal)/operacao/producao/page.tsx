import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clapperboard, Clock, PackageCheck } from "lucide-react";
import { StatTile } from "@/components/dashboard/stat-tile";
import { StatusDot } from "@/components/dashboard/status-dot";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DEMO_PRODUCTIONS, getClient, getProject } from "@/lib/dashboard/demo-data";

export const metadata: Metadata = {
  title: "Produção — Procreating",
  robots: { index: false, follow: false },
};

/** Indicadores mockados — sem backend ainda, por isso o `StatTile` carrega a etiqueta "Demo". */
const STATS = [
  { key: "producao", label: "Conteúdos em produção", value: "6", icon: Clapperboard },
  { key: "aprovacao", label: "Aguardando aprovação", value: "3", icon: Clock },
  { key: "entregas", label: "Entregas desta semana", value: "4", icon: PackageCheck },
];

export default function ProducaoPage() {
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
          <h1 className="font-display text-3xl">Produção</h1>
          <p className="max-w-lg text-sm text-muted-foreground">Controle de conteúdos e entregas em produção.</p>
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
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Conteúdos em produção</h2>
            <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              Demo
            </span>
          </div>
          <div className="overflow-hidden rounded-xl border border-border/60">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead>Conteúdo</TableHead>
                  <TableHead>Projeto</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DEMO_PRODUCTIONS.map((item) => {
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
