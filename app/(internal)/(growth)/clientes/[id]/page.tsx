import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getClientFull } from "@/lib/clientes/queries";
import { listClientPortalInvites } from "@/lib/clientes/portal-invite-actions";
import { getSession } from "@/lib/admin/auth";
import { canViewFinancials } from "@/lib/auth/permissions";
import { ClientStatusSelect } from "@/components/clientes/client-status-select";
import { ClientInfoDialog } from "@/components/clientes/client-info-dialog";
import { ContractsSection } from "@/components/clientes/contracts-section";
import { ContactsSection } from "@/components/clientes/contacts-section";
import { OnboardingTasksList } from "@/components/clientes/onboarding-tasks-list";
import { PortalAccessSection } from "@/components/clientes/portal-access-section";

type Params = { id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const full = await getClientFull(id);
  return { title: full ? `${full.client.name} — Procreating` : "Cliente — Procreating", robots: { index: false, follow: false } };
}

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

function describeEvent(type: string, metadata: Record<string, unknown>): string {
  switch (type) {
    case "client_created":
      return "Cliente criado a partir de um lead convertido";
    default:
      return type;
  }
}

export default async function ClienteDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const [full, session, portalInvites] = await Promise.all([getClientFull(id), getSession(), listClientPortalInvites(id)]);
  if (!full) notFound();
  const canManageContracts = session ? canViewFinancials(session.user.role) : false;

  const { client, strategy, onboarding, contacts, contracts, tasks, events } = full;

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 pt-8 pb-16 lg:px-10">
      <Link href="/clientes" className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-3.5" />
        Clientes
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl">{client.name}</h1>
            {/* "Acessar Home" — pedido explícito, mesmo botão do card em `/clientes`
             *  (`ClientCard`), agora também aqui, direto ao lado do nome. Link pro site público
             *  do cliente (`/clients/<slug>/public`, domínio do Client Hub/portfólio) — sempre
             *  mostrado, mesmo pra cliente cuja página ainda não existe. Abre em nova aba. Branco
             *  (pedido explícito, cor literal, não token de tema) — mesmo estilo do card. */}
            <a
              href={`/clients/${client.slug}/public`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-neutral-900 transition-colors hover:bg-neutral-200"
            >
              Acessar Home
              <ArrowUpRight className="size-3" />
            </a>
          </div>
          {strategy && <p className="text-sm text-muted-foreground">Veio da estratégia "{strategy.name}"</p>}
        </div>
        <div className="flex items-center gap-2">
          <ClientStatusSelect clientId={client.id} status={client.status} />
          <ClientInfoDialog client={client} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <section className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-5">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Cadastro</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
              <Field label="Razão social" value={onboarding?.legal_name} />
              <Field label="Nome fantasia" value={onboarding?.trade_name} />
              <Field label="CNPJ" value={onboarding?.cnpj} />
              <Field label="CPF" value={onboarding?.cpf} />
              <Field label="Endereço" value={onboarding?.address} />
              <Field label="Faturamento" value={onboarding?.billing_info} />
              <Field label="Documento" value={client.document} />
              <Field label="Segmento" value={client.segment} />
            </div>
          </section>

          {(onboarding?.objective || onboarding?.target_audience || onboarding?.offer || onboarding?.positioning) && (
            <section className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-5">
              <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Informações estratégicas</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
                <Field label="Objetivo" value={onboarding?.objective} />
                <Field label="Público-alvo" value={onboarding?.target_audience} />
                <Field label="Oferta" value={onboarding?.offer} />
                <Field label="Posicionamento" value={onboarding?.positioning} />
                <Field label="Canais" value={onboarding?.channels} />
                <Field label="Metas" value={onboarding?.goals} />
              </div>
            </section>
          )}

          {/* `ContractsSection` já mostra o escopo contratado (`scopeItems` — serviço/quantidade/
           *  frequência) como "entregas planejadas" — não precisa de seção própria repetindo a
           *  mesma informação. */}
          <ContractsSection clientId={client.id} contracts={contracts} canManage={canManageContracts} />

          {/* Pedido explícito: nenhum valor em R$ aparece nesta página — pode ser acessada por
           *  quem não é sócio, e "dado sigiloso" é justamente o número (o Financeiro, gated por
           *  `canViewFinancials`, continua sendo o lugar certo pra ver valores). A antiga seção
           *  "Financeiro" (recebido/contratado, lançamento por lançamento) saiu por completo —
           *  era só número, sem nada de entrega. "Quanto já foi entregue este mês" — pedido
           *  explícito de foco — ainda não tem dado real conectado por cliente (Produção/
           *  Entregas do Procreating OS continuam mock, documentado em `docs/roadmap.md`); em
           *  vez de inventar um número, o gap fica honesto aqui até existir dado de verdade. */}
          <section className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-5">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Entregas do mês</h2>
            <p className="text-sm text-muted-foreground">
              Acompanhamento de entregas ainda não conectado a clientes individuais — a área de Produção/Entregas do Procreating OS ainda não tem dado real
              por trás.
            </p>
          </section>

          <section className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-5">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Histórico</h2>
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum evento registrado.</p>
            ) : (
              <ul className="flex flex-col gap-1.5 text-sm">
                {events.map((event) => (
                  <li key={event.id} className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">{dateTimeFormatter.format(new Date(event.created_at))}</span>
                    <span>{describeEvent(event.type, event.metadata as Record<string, unknown>)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <ContactsSection clientId={client.id} contacts={contacts} />

          {/* Fase B do Portal do Cliente — convite de acesso ao `/portal/<slug>` (Supabase Auth
           *  próprio, RLS da Fase A). Ver docs/client-portal-fase-b-plano.md. */}
          <PortalAccessSection clientId={client.id} invites={portalInvites} />

          <section className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-5">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tarefas de onboarding</h2>
            <OnboardingTasksList tasks={tasks} />
          </section>
        </div>
      </div>
    </main>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p>{value}</p>
    </div>
  );
}
