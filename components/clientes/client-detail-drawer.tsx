"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Check, Copy, Loader2, Plus } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StatusDot } from "@/components/dashboard/status-dot";
import { ClientStatusSelect } from "@/components/clientes/client-status-select";
import { ClientInfoDialog } from "@/components/clientes/client-info-dialog";
import { ContractsSection } from "@/components/clientes/contracts-section";
import { ContactsSection } from "@/components/clientes/contacts-section";
import { OnboardingTasksList } from "@/components/clientes/onboarding-tasks-list";
import { ContractFormDialog } from "@/components/clientes/contract-form-dialog";
import { CLIENT_STATUS_LABEL, CLIENT_STATUS_TONE, timeAgo } from "@/components/clientes/client-card";
import { CONTRACT_CATEGORY_LABEL, CONTRACT_CATEGORY_TONE } from "@/lib/financeiro/contract-category";
import { getClientFullAction, updateClientStatusAction } from "@/lib/clientes/actions";
import type { ClientCardData } from "@/lib/clientes/queries";
import type { ClientFull } from "@/lib/clientes/types";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

function describeEvent(type: string): string {
  switch (type) {
    case "client_created":
      return "Cliente criado a partir de um lead convertido";
    default:
      return type;
  }
}

/**
 * "Mini central operacional" do cliente — pedido explícito: NUNCA navega pra
 * `/clientes/[id]` sozinho (a lista continua na mesma página, contexto preservado). A rota
 * `/clientes/[id]` já existe e não foi tocada — vira só um atalho de "abrir em tela cheia" pra
 * quem quiser (ação "Abrir cliente"), não a experiência principal.
 *
 * Dado leve (`ClientCardData`, já carregado pra lista) aparece na hora, sem esperar rede — o
 * cabeçalho (nome/status/categoria) já pinta no frame em que o drawer abre. A visão 360º
 * completa (`ClientFull` — contratos com escopo, contatos, financeiro, eventos, onboarding) é
 * buscada em paralelo via `getClientFullAction` só quando este cliente específico abre, nunca
 * pra lista inteira de uma vez.
 */
export function ClientDetailDrawer({ data, onOpenChange, onArchived }: { data: ClientCardData | null; onOpenChange: (open: boolean) => void; onArchived: () => void }) {
  const router = useRouter();
  const [full, setFull] = useState<ClientFull | null>(null);
  const [loading, setLoading] = useState(false);
  const [creatingContract, setCreatingContract] = useState(false);
  const [copied, setCopied] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [isArchiving, startArchive] = useTransition();

  useEffect(() => {
    if (!data) {
      setFull(null);
      return;
    }
    setLoading(true);
    setFull(null);
    let cancelled = false;
    getClientFullAction(data.client.id).then((result) => {
      if (!cancelled) {
        setFull(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [data]);

  if (!data) return null;
  const { client } = data;

  function handleCopy() {
    if (!full) return;
    const lines = [
      full.client.name,
      full.client.document ? `Documento: ${full.client.document}` : null,
      full.client.segment ? `Segmento: ${full.client.segment}` : null,
      [full.client.city, full.client.state].filter(Boolean).join(" - ") || null,
      full.contacts[0] ? `Contato: ${full.contacts[0].name}${full.contacts[0].email ? ` (${full.contacts[0].email})` : ""}` : null,
    ].filter(Boolean);
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleArchive() {
    startArchive(async () => {
      const result = await updateClientStatusAction(client.id, "churn");
      setArchiveOpen(false);
      if (result.ok) {
        onArchived();
        router.refresh();
      }
    });
  }

  const totalContracted = full ? full.revenue.reduce((sum, row) => sum + Number(row.amount), 0) : 0;
  const totalReceived = full ? full.revenue.filter((row) => row.status === "pago").reduce((sum, row) => sum + Number(row.amount), 0) : 0;
  const allServices = full ? Array.from(new Set(full.contracts.flatMap((c) => c.scopeItems.map((item) => item.service)))) : [];

  return (
    <>
      <Sheet open={data !== null} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full gap-0 overflow-y-auto bg-popover p-6 text-popover-foreground sm:max-w-lg">
          <div className="flex flex-col gap-6 pb-10">
            {/* HEADER — nome, status editável, recorrente/projeto único, ações rápidas. */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <SheetTitle className="text-xl">{client.name}</SheetTitle>
                <StatusDot tone={CLIENT_STATUS_TONE[client.status]} label={CLIENT_STATUS_LABEL[client.status]} />
              </div>
              <SheetDescription>
                {data.categories.includes("recorrente_ativo") ? "Cliente recorrente" : "Projeto único"}
                {client.segment ? ` · ${client.segment}` : ""}
                {" · Cliente desde "}
                {dateFormatter.format(new Date(client.created_at))}
              </SheetDescription>

              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => setCreatingContract(true)}>
                  <Plus className="size-3.5" />
                  Novo contrato
                </Button>
                <Button type="button" variant="outline" size="sm" className="gap-1.5" asChild>
                  <Link href={`/clientes/${client.id}`}>
                    <ArrowUpRight className="size-3.5" />
                    Abrir cliente
                  </Link>
                </Button>
                <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={handleCopy} disabled={!full}>
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copied ? "Copiado" : "Copiar informações"}
                </Button>
                {full && <ClientInfoDialog client={full.client} />}
                <Button type="button" variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => setArchiveOpen(true)}>
                  Arquivar
                </Button>
              </div>
              <ClientStatusSelect clientId={client.id} status={client.status} />
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Carregando visão do cliente...
              </div>
            ) : !full ? (
              <p className="py-16 text-center text-sm text-muted-foreground">Não foi possível carregar este cliente.</p>
            ) : (
              <>
                {/* VISÃO GERAL */}
                <section className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-4">
                  <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Visão geral</h2>
                  <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                    <Stat label="Projetos" value={String(full.contracts.length)} />
                    <Stat label="Contratado" value={currencyFormatter.format(totalContracted)} />
                    <Stat label="Recebido" value={currencyFormatter.format(totalReceived)} />
                    <Stat label="Última atividade" value={timeAgo(client.updated_at)} />
                  </div>
                </section>

                {/* SERVIÇOS CONTRATADOS — chips de contract_scope_items.service, sem estrutura nova. */}
                {allServices.length > 0 && (
                  <section className="flex flex-col gap-2">
                    <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Serviços contratados</h2>
                    <div className="flex flex-wrap gap-1.5">
                      {allServices.map((service) => (
                        <span key={service} className="rounded-full border border-border/60 bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                          {service}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* PROJETOS — reaproveita ContractsSection inteiro (já tem criar/editar/status). */}
                <ContractsSection clientId={client.id} contracts={full.contracts} />

                {/* CONTATOS — reaproveita ContactsSection inteiro. */}
                <ContactsSection clientId={client.id} contacts={full.contacts} />

                {full.tasks.length > 0 && (
                  <section className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-4">
                    <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Tarefas de onboarding</h2>
                    <OnboardingTasksList tasks={full.tasks} />
                  </section>
                )}

                {/* ATIVIDADE RECENTE — lê `events` já existente (entity_type='client'), mesma
                    tabela transversal que o resto do produto usa; nenhum sistema novo. */}
                <section className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-4">
                  <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Atividade recente</h2>
                  {full.events.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum evento registrado ainda.</p>
                  ) : (
                    <ul className="flex flex-col gap-2 text-sm">
                      {full.events.slice(0, 8).map((event) => (
                        <li key={event.id} className="flex items-baseline justify-between gap-3">
                          <span>{describeEvent(event.type)}</span>
                          <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(event.created_at)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <ContractFormDialog clientId={client.id} open={creatingContract} onOpenChange={setCreatingContract} />

      <ConfirmDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        title="Arquivar cliente?"
        description={`"${client.name}" vai ficar marcado como Churn — some da visão de clientes ativos/recorrentes, mas nada é excluído (contratos, contatos e histórico continuam intactos e podem ser reabertos mudando o status).`}
        confirmLabel="Arquivar"
        isPending={isArchiving}
        onConfirm={handleArchive}
      />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="font-mono tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
