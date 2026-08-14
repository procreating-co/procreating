import type { Metadata } from "next";
import { Users } from "lucide-react";
import { StatTile } from "@/components/dashboard/stat-tile";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusDot } from "@/components/dashboard/status-dot";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listTeamUsers } from "@/lib/operacao/queries";

export const metadata: Metadata = {
  title: "Equipe — Procreating",
  robots: { index: false, follow: false },
};

const ROLE_LABEL: Record<string, string> = {
  owner: "Sócio",
  admin: "Administrador",
  commercial: "Comercial",
  marketing: "Marketing",
  operations: "Operações",
  finance: "Financeiro",
  production: "Produção",
  client: "Cliente",
};

/** `users` real no lugar de `DEMO_TEAM` — "Status: Ativo" que antes era hardcoded pra todo mundo
 *  agora reflete o que já é real: ter uma linha em `users` = ter acesso ao Procreating OS.
 *  Capacidade/utilização por pessoa continuam fora de escopo (não existe apontamento de horas). */
export default async function EquipePage() {
  const users = await listTeamUsers();

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 pt-8 pb-16 lg:px-10">
      <PageHeader title="Equipe" description="Quem tem acesso ao Procreating OS." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile demo={false} label="Pessoas cadastradas" value={String(users.length)} icon={<Users className="size-4.5" />} />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pessoas</h2>
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
              {users.map((user) => (
                <TableRow key={user.id} className="border-border/60">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground/10 font-mono text-[11px] uppercase text-muted-foreground">
                        {user.name.slice(0, 2)}
                      </div>
                      {user.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{ROLE_LABEL[user.role] ?? user.role}</TableCell>
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
