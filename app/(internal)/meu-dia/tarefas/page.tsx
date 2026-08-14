import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/supabase/current-user";
import { listTasksByAssignee } from "@/lib/tasks/queries";
import { MyDayTasks } from "@/components/meu-dia/my-day-tasks";
import { ADMIN_LOGIN_PATH } from "@/lib/admin/auth/constants";

export const metadata: Metadata = {
  title: "Tarefas — Procreating OS",
  robots: { index: false, follow: false },
};

/** Mesma lista de My Day, mas sem o filtro "vencendo hoje" — todas as tarefas atribuídas ao
 *  usuário, de qualquer prazo (inclusive as de onboarding que o RPC atribui a quem fecha um
 *  negócio). Reaproveita `MyDayTasks` (mesma UI de criar/marcar feita). */
export default async function TasksPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect(ADMIN_LOGIN_PATH);

  const tasks = await listTasksByAssignee(userId);

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 py-16 lg:px-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl">Tarefas</h1>
        <p className="max-w-lg text-sm text-muted-foreground">Todas as suas tarefas, de qualquer prazo — Meu Dia mostra só o que vence hoje ou está atrasado.</p>
      </div>
      <MyDayTasks tasks={tasks} userId={userId} />
    </main>
  );
}
