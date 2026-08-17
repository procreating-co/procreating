import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import { listUsers, listPendingInvites } from "@/lib/admin/users/queries";
import { requireUserManagementAccess } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/dashboard/page-header";
import { SectionHeader } from "@/components/dashboard/section-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { RevokeInviteButton } from "@/components/configuracoes/revoke-invite-button";
import type { UserRole } from "@/lib/supabase/types/database";

export const metadata: Metadata = {
  title: "Usuários — Procreating",
  robots: { index: false, follow: false },
};

const ROLE_LABEL: Record<UserRole, string> = {
  owner: "Sócio",
  admin: "Administrador",
  commercial: "Comercial",
  marketing: "Marketing",
  operations: "Operações",
  finance: "Financeiro",
  production: "Produção",
  client: "Cliente",
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

/**
 * "ERP totalmente funcional" — antes era um `ComingSoon` puro; agora que RBAC (`can_view_financials`,
 * `can_manage_users`) existe de verdade, papel importa, e "quem tem acesso a quê" precisa de tela
 * própria em vez de só um allowlist em código. Escopo explícito desta rodada: listar `users`
 * (já existe, real), ver papel de cada um, e revogar convite (`team_invites`) ainda pendente —
 * NÃO um fluxo de convite novo (`inviteTeamMemberAction`, usado pelo menu "+", continua sendo o
 * único jeito de convidar).
 */
export default async function ConfiguracoesUsuariosPage() {
  const access = await requireUserManagementAccess();
  if (!access.ok) {
    return (
      <main className="mx-auto flex max-w-[1400px] flex-col px-6 pt-8 pb-16 lg:px-10">
        <EmptyState icon={ShieldAlert} title="Sem acesso" description={access.error} />
      </main>
    );
  }

  const [users, pendingInvites] = await Promise.all([listUsers(), listPendingInvites()]);

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 pt-8 pb-16 lg:px-10">
      <PageHeader title="Usuários" description="Quem tem acesso ao Procreating OS e com qual papel. Convites novos continuam saindo pelo menu +." />

      <section className="flex flex-col gap-3">
        <SectionHeader title="Equipe" description={`${users.length} conta${users.length === 1 ? "" : "s"} ativa${users.length === 1 ? "" : "s"}.`} />
        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum usuário cadastrado ainda.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border/60 rounded-xl border border-border/60 bg-card">
            {users.map((user) => (
              <li key={user.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
                <span className="rounded-full border border-border/60 px-2.5 py-1 text-xs text-muted-foreground">{ROLE_LABEL[user.role] ?? user.role}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeader title="Convites pendentes" description={`${pendingInvites.length} convite${pendingInvites.length === 1 ? "" : "s"} aguardando cadastro em /admin/signup.`} />
        {pendingInvites.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum convite pendente.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border/60 rounded-xl border border-border/60 bg-card">
            {pendingInvites.map((invite) => (
              <li key={invite.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{invite.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {invite.email} · convidado em {dateFormatter.format(new Date(invite.createdAt))}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-border/60 px-2.5 py-1 text-xs text-muted-foreground">{ROLE_LABEL[invite.role] ?? invite.role}</span>
                  <RevokeInviteButton inviteId={invite.id} name={invite.name} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
