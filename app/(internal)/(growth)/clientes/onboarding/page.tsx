import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { listTasksByContextType } from "@/lib/tasks/queries";
import { listClients } from "@/lib/clientes/queries";
import { EmptyState } from "@/components/dashboard/empty-state";
import { OnboardingTasksList } from "@/components/clientes/onboarding-tasks-list";

export const metadata: Metadata = {
  title: "Onboarding — Procreating",
  robots: { index: false, follow: false },
};

/** Tarefas de `context_type = "client_onboarding"` de todos os clientes, agrupadas por cliente —
 *  as 3 tarefas padrão que o RPC `close_lead_and_create_client` cria ao fechar um negócio. */
export default async function ClientesOnboardingPage() {
  const [tasks, clients] = await Promise.all([listTasksByContextType("client_onboarding"), listClients()]);
  const clientById = new Map(clients.map((client) => [client.id, client]));

  const groups = new Map<string, typeof tasks>();
  for (const task of tasks) {
    const clientId = task.context_id ?? "";
    if (!groups.has(clientId)) groups.set(clientId, []);
    groups.get(clientId)!.push(task);
  }

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 pt-8 pb-16 lg:px-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl">Onboarding</h1>
        <p className="max-w-lg text-sm text-muted-foreground">
          Tarefas de integração de cada cliente fechado — enviar contrato, agendar kickoff, configurar acesso.
        </p>
      </div>

      {groups.size === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nenhum onboarding em andamento"
          description="Assim que um negócio for fechado no Pipeline, as tarefas de integração do cliente aparecem aqui automaticamente."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from(groups.entries()).map(([clientId, clientTasks]) => {
            const client = clientById.get(clientId);
            return (
              <div key={clientId} className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card/40 p-5">
                <div className="flex items-center justify-between gap-3">
                  <Link href={`/clientes/${clientId}`} className="text-sm font-medium hover:underline">
                    {client?.name ?? "Cliente removido"}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {clientTasks.filter((t) => t.status === "done").length}/{clientTasks.length}
                  </span>
                </div>
                <OnboardingTasksList tasks={clientTasks} />
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
