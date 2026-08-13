import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getClientFull } from "@/lib/clientes/queries";
import { ClientStatusSelect } from "@/components/clientes/client-status-select";
import { OnboardingTasksList } from "@/components/clientes/onboarding-tasks-list";

type Params = { id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const full = await getClientFull(id);
  return { title: full ? `${full.client.name} — Procreating` : "Cliente — Procreating", robots: { index: false, follow: false } };
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });
const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

const REVENUE_STATUS_LABEL: Record<string, string> = { pendente: "Pendente", pago: "Pago", atrasado: "Atrasado", cancelado: "Cancelado" };

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
  const full = await getClientFull(id);
  if (!full) notFound();

  const { client, strategy, onboarding, contacts, contracts, revenue, tasks, events } = full;
  const totalContracted = revenue.reduce((sum, row) => sum + Number(row.amount), 0);
  const totalReceived = revenue.filter((row) => row.status === "pago").reduce((sum, row) => sum + Number(row.amount), 0);

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 py-16 lg:px-10">
      <Link href="/clientes" className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-3.5" />
        Clientes
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl">{client.name}</h1>
          {strategy && <p className="text-sm text-muted-foreground">Veio da estratégia "{strategy.name}"</p>}
        </div>
        <ClientStatusSelect clientId={client.id} status={client.status} />
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

          <section className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-5">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Contrato{contracts.length > 1 ? "s" : ""}</h2>
            {contracts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum contrato registrado.</p>
            ) : (
              contracts.map((contract) => (
                <div key={contract.id} className="flex flex-col gap-2 border-t border-border/60 pt-3 text-sm first:border-t-0 first:pt-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium capitalize">{contract.type}</span>
                    <span className="text-muted-foreground">
                      {dateFormatter.format(new Date(contract.start_date))}
                      {contract.end_date ? ` até ${dateFormatter.format(new Date(contract.end_date))}` : ""}
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    {contract.type === "recorrente"
                      ? `${currencyFormatter.format(Number(contract.monthly_value ?? 0))}/mês · vencimento dia ${contract.due_day ?? "—"}`
                      : currencyFormatter.format(Number(contract.total_value ?? 0))}
                  </p>
                  {contract.scopeItems.length > 0 && (
                    <ul className="flex flex-col gap-1 text-muted-foreground">
                      {contract.scopeItems.map((item) => (
                        <li key={item.id}>
                          · {item.service}
                          {item.quantity ? ` (${item.quantity}${item.frequency ? `, ${item.frequency}` : ""})` : ""}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            )}
          </section>

          <section className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Financeiro</h2>
              <span className="text-xs text-muted-foreground">
                {currencyFormatter.format(totalReceived)} recebido de {currencyFormatter.format(totalContracted)} contratado
              </span>
            </div>
            {revenue.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum lançamento ainda.</p>
            ) : (
              <ul className="flex flex-col gap-1.5 text-sm">
                {revenue.map((row) => (
                  <li key={row.id} className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">
                      {row.description} · {dateFormatter.format(new Date(row.due_date))}
                    </span>
                    <span className="flex items-center gap-2">
                      {currencyFormatter.format(Number(row.amount))}
                      <span className="text-xs text-muted-foreground">({REVENUE_STATUS_LABEL[row.status] ?? row.status})</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
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
          <section className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-5">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Contatos</h2>
            {contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum contato cadastrado.</p>
            ) : (
              <ul className="flex flex-col gap-3 text-sm">
                {contacts.map((contact) => (
                  <li key={contact.id} className="flex flex-col gap-0.5">
                    <span className="font-medium">
                      {contact.name} {contact.is_primary && <span className="text-xs text-muted-foreground">(principal)</span>}
                    </span>
                    {contact.role_title && <span className="text-xs text-muted-foreground">{contact.role_title}</span>}
                    {contact.whatsapp && <span className="text-xs text-muted-foreground">{contact.whatsapp}</span>}
                    {contact.email && <span className="text-xs text-muted-foreground">{contact.email}</span>}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-5">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tarefas de onboarding</h2>
            <OnboardingTasksList clientId={client.id} tasks={tasks} />
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
