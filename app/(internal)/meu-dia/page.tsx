import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, ArrowRight, CalendarClock, UserRound } from "lucide-react";
import { getCurrentUserId } from "@/lib/supabase/current-user";
import { computeWorkspaceOverview } from "@/lib/meu-dia/queries";
import { GreetingHeader } from "@/components/dashboard/greeting-header";
import { MyDayTasks } from "@/components/meu-dia/my-day-tasks";
import { SectionHeader } from "@/components/dashboard/section-header";
import { EmptyInline } from "@/components/dashboard/empty-inline";
import { ADMIN_LOGIN_PATH } from "@/lib/admin/auth/constants";

export const metadata: Metadata = {
  title: "Meu Dia — Procreating",
  robots: { index: false, follow: false },
};

const upcomingDateFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" });

/**
 * Workspace — página única (revertido de 5 abas com gamificação: XP/streak/timer/conquistas
 * nunca foram pedidos de verdade, contrariam o roadmap real, onde isso é Fase 6 futura). Cockpit
 * real: o que precisa de atenção agora, tarefas de hoje com criação inline, próximos prazos,
 * progresso simples do dia (sem badge/fogo/nível), visibilidade do outro sócio — tudo dado real
 * (`lib/meu-dia/queries.ts`), nunca inventado; fonte vazia = seção/linha omitida, nunca "0
 * encontrados" forçado.
 */
export default async function MeuDiaPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect(ADMIN_LOGIN_PATH);

  const overview = await computeWorkspaceOverview(userId);

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-10 px-6 pt-8 pb-16 lg:px-10">
      <GreetingHeader />

      <section className="flex flex-col gap-4">
        <SectionHeader title="Atenção agora" />
        {overview.attention.length === 0 ? (
          <EmptyInline icon={AlertTriangle} label="Nada precisa de atenção agora." />
        ) : (
          <ul className="flex flex-col divide-y divide-border/60 rounded-xl border border-border/60 bg-card">
            {overview.attention.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="flex items-center justify-between gap-3 px-5 py-3.5 text-sm transition-colors hover:bg-foreground/[0.03]">
                  {item.label}
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="tarefas-de-hoje" className="flex scroll-mt-20 flex-col gap-4">
        <SectionHeader
          title="Tarefas de hoje"
          description={overview.todayProgress ? `${overview.todayProgress.done} de ${overview.todayProgress.total} tarefas concluídas hoje` : undefined}
        />
        <MyDayTasks tasks={overview.dueTasks} userId={userId} />
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeader title="Próximos prazos" description="Tarefas com prazo nos próximos 7 dias." />
        {overview.upcomingTasks.length === 0 ? (
          <EmptyInline icon={CalendarClock} label="Nenhum prazo nos próximos 7 dias." />
        ) : (
          <ul className="flex flex-col divide-y divide-border/60 rounded-xl border border-border/60 bg-card">
            {overview.upcomingTasks.map((task) => (
              <li key={task.id} className="flex items-center justify-between gap-3 px-5 py-3.5 text-sm">
                <span>{task.title}</span>
                {task.due_date && <span className="text-xs text-muted-foreground">{upcomingDateFormatter.format(new Date(`${task.due_date}T00:00:00`))}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {overview.otherUser && (
        <section className="flex flex-col gap-4">
          <SectionHeader title={`Prioridades de ${overview.otherUser.name.split(" ")[0]}`} description="Transparência, não vigilância — só o que está vencendo hoje ou atrasado." />
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
