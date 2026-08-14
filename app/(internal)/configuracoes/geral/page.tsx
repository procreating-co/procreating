import type { Metadata } from "next";
import { getSession } from "@/lib/admin/auth";
import { getCurrentMonthGoal } from "@/lib/dashboard/goals";
import { signOutAction } from "@/app/admin/(protected)/actions";
import { RevenueGoalForm } from "@/components/configuracoes/revenue-goal-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "General — Procreating OS",
  robots: { index: false, follow: false },
};

const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  commercial: "Comercial",
  marketing: "Marketing",
  operations: "Operações",
  finance: "Financeiro",
  production: "Produção",
  client: "Cliente",
};

/**
 * "General" — primeira aba de Settings (`/configuracoes` redireciona pra cá). Reúne o que era
 * antes um botão solto no rodapé da sidebar ("Sair") + a meta mensal de faturamento (decisão do
 * redesign do Dashboard — sem UI de edição em lugar nenhum, o Dashboard nunca teria de onde ler
 * a meta corrente).
 */
export default async function ConfiguracoesGeralPage() {
  const session = await getSession();
  const goal = await getCurrentMonthGoal();

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 pt-8 pb-16 lg:px-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl">General</h1>
        <p className="max-w-lg text-sm text-muted-foreground">Sua conta e a meta de faturamento que o Dashboard usa pra medir ritmo do mês.</p>
      </div>

      <section className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card/40 p-6">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Conta</h2>
        {session && (
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">{session.user.name}</p>
            <p className="text-sm text-muted-foreground">{session.user.email}</p>
            <p className="text-xs text-muted-foreground">{ROLE_LABEL[session.user.role] ?? session.user.role}</p>
          </div>
        )}
        <form action={signOutAction} className="mt-2">
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card/40 p-6">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Meta mensal de faturamento</h2>
        <p className="text-sm text-muted-foreground">
          Usada pelo Dashboard pra calcular "% da meta" e o ritmo esperado — uma linha por mês, meses passados preservam a meta que valia na época.
        </p>
        <RevenueGoalForm currentAmount={goal ? Number(goal.amount) : null} />
      </section>
    </main>
  );
}
