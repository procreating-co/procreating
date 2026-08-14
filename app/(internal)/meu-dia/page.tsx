import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/supabase/current-user";
import { listTasksByAssignee } from "@/lib/tasks/queries";
import { GreetingHeader } from "@/components/dashboard/greeting-header";
import { MyDayTasks } from "@/components/meu-dia/my-day-tasks";
import { ADMIN_LOGIN_PATH } from "@/lib/admin/auth/constants";

export const metadata: Metadata = {
  title: "Meu Dia — Procreating",
  robots: { index: false, follow: false },
};

/**
 * "Meu Espaço" desta fase — só "Meu Dia": saudação + tarefas pessoais (`tasks` com
 * `context_type` nulo, mas também mostra qualquer outra atribuída ao usuário, ex.: onboarding).
 * Pensada como transversal desde já (`lib/tasks/**`), sem hábito/gamificação/calendário — fora
 * do escopo desta fase.
 */
export default async function MeuDiaPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect(ADMIN_LOGIN_PATH);

  const tasks = await listTasksByAssignee(userId);

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-10 px-6 py-16 lg:px-10">
      <GreetingHeader />
      <MyDayTasks tasks={tasks} userId={userId} />
    </main>
  );
}
