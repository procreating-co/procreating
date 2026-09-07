import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FolderPlus, UserRound } from "lucide-react";
import { getCurrentUserId } from "@/lib/supabase/current-user";
import { computeWorkspaceOverview, pickRecommendedTask } from "@/lib/workspace/queries";
import { listTeamUsers } from "@/lib/operacao/queries";
import { listClientsForTasksAction, listTaskGroupsForTasksAction, getRunningFocusSessionAction } from "@/lib/tasks/actions";
import { listTaskStrategiesAction } from "@/lib/tasks/strategy-actions";
import { listTimeBlocksForDayAction } from "@/lib/tasks/time-block-actions";
import { todayISO } from "@/lib/date";
import { GreetingHeader } from "@/components/dashboard/greeting-header";
import { Button } from "@/components/ui/button";
import { WorkspaceTasks } from "@/components/workspace-tasks/workspace-tasks";
import { AttentionPanel } from "@/components/workspace-tasks/attention-panel";
import { FocusPanel } from "@/components/workspace-tasks/focus-panel";
import { WeekView } from "@/components/workspace-tasks/week-view";
import { SectionHeader } from "@/components/dashboard/section-header";
import { EmptyInline } from "@/components/dashboard/empty-inline";
import { ADMIN_LOGIN_PATH } from "@/lib/admin/auth/constants";

export const metadata: Metadata = {
  title: "Workspace — Procreating",
  robots: { index: false, follow: false },
};

/**
 * Workspace — redesign "clareza operacional" (pedido explícito): a mesma página/dado real de
 * sempre (`lib/workspace/queries.ts`, nunca mockado), reorganizada em duas colunas — execução
 * (captura + Agora/Próximas/Mais tarde/Concluídas, `WorkspaceTasks`) e um painel lateral "Foco de
 * hoje" (`FocusPanel`: timer, próxima tarefa recomendada, progresso, agenda, leads parados).
 * "Atenção agora" virou cards clicáveis e dispensáveis (`AttentionPanel`). Sidebar/header/tema
 * seguem sendo os mesmos do resto do ERP (`app/(internal)/layout.tsx`) — fora do escopo deste
 * pedido, que era só esta página.
 */
export default async function WorkspacePage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect(ADMIN_LOGIN_PATH);

  const [overview, teamMembers, clients, runningFocusSession, strategies, todayTimeBlocks] = await Promise.all([
    computeWorkspaceOverview(userId),
    listTeamUsers(),
    listClientsForTasksAction(),
    getRunningFocusSessionAction(),
    listTaskStrategiesAction(),
    listTimeBlocksForDayAction(userId, todayISO()),
  ]);
  const taskGroups = await listTaskGroupsForTasksAction(overview.dueTasks.map((t) => t.id));
  const clientNameById = new Map(clients.map((c) => [c.id, c.name]));
  const recommendedTask = pickRecommendedTask(overview.dueTasks);

  const openTasksCount = overview.dueTasks.filter((t) => t.status !== "done").length;
  const donePct = overview.todayProgress && overview.todayProgress.total > 0 ? Math.round((overview.todayProgress.done / overview.todayProgress.total) * 100) : null;
  const subtitle =
    overview.attention.length > 0
      ? `${overview.attention.length} ${overview.attention.length === 1 ? "área pede" : "áreas pedem"} atenção hoje.`
      : "Tudo em dia — nada urgente agora.";

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 pt-8 pb-16 lg:px-10">
      {/* Topo enxuto (pedido explícito: "evitar que a saudação ocupe espaço excessivo") —
       *  saudação + contexto do dia numa linha, resumo compacto na outra, sem cards grandes. */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <GreetingHeader />
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href="/propostas">
              <FolderPlus className="size-3.5" />
              Criar Projeto
            </Link>
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
          <span>
            <span className="font-medium text-foreground">{openTasksCount}</span> tarefa{openTasksCount === 1 ? "" : "s"} aberta{openTasksCount === 1 ? "" : "s"}
          </span>
          {overview.todayProgress && (
            <span>
              <span className="font-medium text-foreground">{overview.todayProgress.total}</span> vencendo hoje
            </span>
          )}
          {donePct !== null && (
            <span>
              <span className="font-medium text-foreground">{donePct}%</span> concluído hoje
            </span>
          )}
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <SectionHeader title="Atenção agora" />
        <AttentionPanel items={overview.attention} />
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <section id="tarefas-de-hoje" className="flex scroll-mt-20 flex-col gap-4">
          <SectionHeader
            title="Hoje"
            description={overview.todayProgress ? `${overview.todayProgress.done} de ${overview.todayProgress.total} tarefas concluídas hoje` : undefined}
          />
          <WorkspaceTasks
            tasks={overview.dueTasks}
            userId={userId}
            teamMembers={teamMembers}
            clients={clients}
            taskGroups={taskGroups}
            strategies={strategies}
            todayDate={todayISO()}
          />
        </section>

        <FocusPanel
          recommendedTask={recommendedTask}
          todayProgress={overview.todayProgress}
          todayTimeBlocks={todayTimeBlocks}
          clientNameById={clientNameById}
          staleLeads={overview.staleLeads}
          runningSession={runningFocusSession}
        />
      </div>

      <section className="flex flex-col gap-4">
        {/* Minimalismo — "clique pra marcar concluída" era instrução de uso de um checkbox, um
         *  elemento que já é auto-explicativo. */}
        <SectionHeader title="Semana" description="Hoje e os próximos 6 dias." />
        <WeekView tasks={overview.weekTasks} userId={userId} teamMembers={teamMembers} />
      </section>

      {overview.otherUser && (
        <section className="flex flex-col gap-4">
          {/* Minimalismo — mantido curto: é a única frase da tela que explica algo não-óbvio
           *  (por que mostrar tarefa de outra pessoa aqui não é vigilância). */}
          <SectionHeader title={`Prioridades de ${overview.otherUser.name.split(" ")[0]}`} description="Transparência, não vigilância." />
          {overview.otherUser.tasks.length === 0 ? (
            <EmptyInline icon={UserRound} label="Nada vencendo hoje ou atrasado." />
          ) : (
            <ul className="flex flex-col divide-y divide-border/60 rounded-xl border border-border/60 bg-card/40">
              {overview.otherUser.tasks.map((task) => (
                <li key={task.id} className="px-5 py-3 text-sm text-muted-foreground">
                  {task.title}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}
