import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Briefcase, ListTodo, Users } from "lucide-react";
import { StatTile } from "@/components/dashboard/stat-tile";
import { StatusDot } from "@/components/dashboard/status-dot";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DEMO_TEAM } from "@/lib/dashboard/demo-data";

export const metadata: Metadata = {
  title: "Equipe — Procreating",
  robots: { index: false, follow: false },
};

/** Indicadores mockados — sem backend ainda, por isso o `StatTile` carrega a etiqueta "Demo". */
const STATS = [
  { key: "pessoas", label: "Pessoas cadastradas", value: String(DEMO_TEAM.length), icon: Users },
  { key: "projetos-pessoa", label: "Projetos por pessoa", value: "2", icon: Briefcase },
  { key: "demandas", label: "Demandas abertas", value: "5", icon: ListTodo },
];

export default function EquipePage() {
  return (
      <main className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 py-16 lg:px-10">
        <Link
          href="/operacao"
          className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Operação
        </Link>

        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl">Equipe</h1>
          <p className="max-w-lg text-sm text-muted-foreground">Visão da equipe envolvida nos projetos.</p>
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
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pessoas</h2>
            <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              Demo
            </span>
          </div>
          <div className="overflow-hidden rounded-xl border border-border/60">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead>Nome</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DEMO_TEAM.map((person) => (
                  <TableRow key={person.name} className="border-border/60">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground/10 font-mono text-[11px] uppercase text-muted-foreground">
                          {person.name.slice(0, 2)}
                        </div>
                        {person.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{person.role}</TableCell>
                    <TableCell>
                      <StatusDot tone="active" label="Ativo" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
  );
}
