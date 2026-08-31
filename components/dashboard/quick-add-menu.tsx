"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Building2, CheckSquare2, Handshake, Plus, Receipt, UserPlus } from "lucide-react";
import { QUICK_ADD_SHORTCUT_EVENT } from "@/components/dashboard/keyboard-shortcuts";
import { Command, CommandDialog, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LeadFormDialog } from "@/components/comercial/lead-form-dialog";
import { ExpenseFormDialog } from "@/components/financeiro/expense-form-dialog";
import { OnboardingModal } from "@/components/onboarding/onboarding-modal";
import { createWonLeadForSaleAction, listStrategiesAction } from "@/lib/comercial/actions";
import { createTaskAction, createTaskBatchAction, listClientsForTasksAction } from "@/lib/tasks/actions";
import { describeQuickTaskPreview, parseQuickTask, type QuickParseClient } from "@/lib/tasks/quick-parse";
import { parseTaskBatch } from "@/lib/tasks/batch-parse";
import { inviteTeamMemberAction } from "@/lib/admin/auth/actions";
import { listTeamUsersAction } from "@/lib/operacao/actions";
import { useAdminUser } from "@/lib/admin/auth/auth-context";
import type { LeadWithRelations } from "@/lib/comercial/types";
import type { Strategy, User, UserRole } from "@/lib/supabase/types/database";

type Step = "picker" | "lead" | "venda" | "despesa" | "tarefa" | "equipe";

const TEAM_ROLE_LABEL: Record<Exclude<UserRole, "client">, string> = {
  owner: "Sócio",
  admin: "Admin",
  commercial: "Comercial",
  marketing: "Marketing",
  operations: "Operações",
  finance: "Financeiro",
  production: "Produção",
  dev_tester: "Dev tester (acesso mascarado)",
};

/**
 * Botão "+" do top nav — um ponto de entrada só pra criar qualquer coisa no ERP sem primeiro
 * navegar até a área certa. Mesma casca visual da busca (`Command`/`CommandDialog`) na primeira
 * tela (escolher o tipo); cada tipo então delega pro fluxo que já existe, nunca duplica
 * formulário:
 *
 * - Lead → `LeadFormDialog` (mesmo do CRM) — `onCreated` leva pro CRM, reforçando visualmente
 *   que "foi automático".
 * - Venda → não existe fluxo de "venda direta sem lead" ainda, e é o único genuinamente novo:
 *   1 campo (nome) cria um lead JÁ no estágio "Fechado" (`createWonLeadForSaleAction`) e abre o
 *   MESMO `OnboardingModal` que soltar um card em "Fechado" no Kanban já abre — pontual/
 *   recorrente, cliente, contrato, escopo, tudo numa transação (`close_lead_and_create_client`),
 *   sem reescrever nada disso aqui.
 * - Despesa → `ExpenseFormDialog` (mesmo do Financeiro).
 * - Tarefa → 1 campo (título), mesma `createTaskAction` que a busca já usa.
 *
 * Ficou fora deste menu por ora (poucos botões > cobertura total): cliente manual avulso e
 * receita pontual solta — dá pra adicionar depois se fizerem falta, mas hoje passam por Venda
 * (que já cobre cliente+contrato+receita junto) ou pela tela do Financeiro.
 */
export function QuickAddMenu() {
  const router = useRouter();
  const user = useAdminUser();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("picker");
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [clients, setClients] = useState<QuickParseClient[]>([]);

  const [saleName, setSaleName] = useState("");
  const [saleValue, setSaleValue] = useState("");
  const [saleLead, setSaleLead] = useState<LeadWithRelations | null>(null);
  const [saleError, setSaleError] = useState<string | null>(null);

  const [taskText, setTaskText] = useState("");
  const [taskError, setTaskError] = useState<string | null>(null);

  const [teamName, setTeamName] = useState("");
  const [teamEmail, setTeamEmail] = useState("");
  const [teamRole, setTeamRole] = useState<UserRole>("production");
  const [teamError, setTeamError] = useState<string | null>(null);
  const [teamInvited, setTeamInvited] = useState(false);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (step === "lead" && strategies.length === 0) {
      listStrategiesAction().then(setStrategies);
    }
    if (step === "tarefa" && teamMembers.length === 0) {
      listTeamUsersAction().then(setTeamMembers);
    }
    if (step === "tarefa" && clients.length === 0) {
      listClientsForTasksAction().then(setClients);
    }
  }, [step, strategies.length, teamMembers.length, clients.length]);

  // Atalhos de teclado (§61, `KeyboardShortcuts`) — "N"/"C" abrem este menu já no passo certo,
  // sem duplicar o formulário/Server Action que o picker já delega.
  useEffect(() => {
    function onShortcut(event: Event) {
      setStep((event as CustomEvent<Step>).detail);
      setOpen(true);
    }
    window.addEventListener(QUICK_ADD_SHORTCUT_EVENT, onShortcut);
    return () => window.removeEventListener(QUICK_ADD_SHORTCUT_EVENT, onShortcut);
  }, []);

  function closeAll() {
    setOpen(false);
    setStep("picker");
    setSaleName("");
    setSaleValue("");
    setSaleLead(null);
    setSaleError(null);
    setTaskText("");
    setTaskError(null);
    setTeamName("");
    setTeamEmail("");
    setTeamRole("production");
    setTeamError(null);
    setTeamInvited(false);
  }

  function handleSaleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaleError(null);
    startTransition(async () => {
      const result = await createWonLeadForSaleAction(saleName, saleValue.trim() ? Number(saleValue) : null);
      if (!result.ok || !result.lead) {
        setSaleError(result.ok ? "Falha ao criar." : result.error);
        return;
      }
      setOpen(false); // fecha o picker — o OnboardingModal assume a tela a partir daqui
      setSaleLead(result.lead);
    });
  }

  function handleTaskSubmit(e: FormEvent) {
    e.preventDefault();
    if (!taskText.trim()) return;
    setTaskError(null);

    const batch = parseTaskBatch(taskText, teamMembers, clients);
    if (batch) {
      startTransition(async () => {
        for (const group of [{ title: null as string | null, items: batch.ungrouped }, ...batch.groups]) {
          if (group.items.length === 0) continue;
          const result = await createTaskBatchAction(
            group.title,
            group.items.map((item) => ({
              title: item.title,
              assigneeId: item.assigneeId ?? user.id,
              dueDate: item.dueDate,
              dueTime: item.dueTime,
              clientId: item.clientId,
              estimatedMinutes: item.estimatedMinutes,
              contextType: null,
              contextId: null,
            })),
          );
          if (!result.ok) {
            setTaskError(result.error);
            return;
          }
        }
        closeAll();
        router.refresh();
      });
      return;
    }

    const parsed = parseQuickTask(taskText, teamMembers, clients);
    if (!parsed.title) {
      setTaskError("A tarefa ficou sem título depois de tirar data/hora/responsável — reescreva.");
      return;
    }
    // Ambiguidade de cliente (2+ batendo) — o picker do "+" é rápido de propósito, sem diálogo de
    // confirmação próprio aqui: cria sem cliente (nunca escolhe sozinho) e deixa a correção pra
    // `/workspace` (que tem o diálogo de confirmação) ou pra edição manual da tarefa.
    startTransition(async () => {
      const result = await createTaskAction({
        title: parsed.title,
        assigneeId: parsed.assigneeId ?? user.id,
        dueDate: parsed.dueDate,
        dueTime: parsed.dueTime,
        clientId: parsed.clientCandidates.length > 1 ? null : parsed.clientId,
        estimatedMinutes: parsed.estimatedMinutes,
        contextType: null,
        contextId: null,
      });
      if (!result.ok) {
        setTaskError(result.error);
        return;
      }
      closeAll();
      router.refresh();
    });
  }

  function handleTeamSubmit(e: FormEvent) {
    e.preventDefault();
    setTeamError(null);
    startTransition(async () => {
      const result = await inviteTeamMemberAction({ name: teamName, email: teamEmail, role: teamRole });
      if (!result.ok) {
        setTeamError(result.error);
        return;
      }
      setTeamInvited(true);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setStep("picker");
        }}
        aria-label="Adicionar"
        title="Adicionar — lead, venda, despesa ou tarefa"
        className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
      >
        <Plus className="size-4" />
      </button>

      <CommandDialog
        open={open && step === "picker"}
        onOpenChange={(next) => !next && setOpen(false)}
        title="Adicionar"
        description="Criar rapidamente um lead, venda, despesa, tarefa ou convidar alguém pro time"
      >
        <Command>
          <CommandList>
            <CommandGroup heading="O que você quer adicionar?">
              <CommandItem onSelect={() => setStep("lead")}>
                <Handshake className="size-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span>Novo lead</span>
                  <span className="text-xs text-muted-foreground">Entra no funil, aparece no CRM</span>
                </div>
              </CommandItem>
              <CommandItem onSelect={() => setStep("venda")}>
                <Building2 className="size-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span>Nova venda</span>
                  <span className="text-xs text-muted-foreground">Negócio fechado sem lead prévio</span>
                </div>
              </CommandItem>
              <CommandItem onSelect={() => setStep("despesa")}>
                <Receipt className="size-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span>Nova despesa</span>
                  <span className="text-xs text-muted-foreground">Entra no Financeiro</span>
                </div>
              </CommandItem>
              <CommandItem onSelect={() => setStep("tarefa")}>
                <CheckSquare2 className="size-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span>Nova tarefa</span>
                  <span className="text-xs text-muted-foreground">Entra no Meu Dia</span>
                </div>
              </CommandItem>
              <CommandItem onSelect={() => setStep("equipe")}>
                <UserPlus className="size-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span>Novo membro da equipe</span>
                  <span className="text-xs text-muted-foreground">Convida pra criar conta no ERP</span>
                </div>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>

      {step === "lead" && (
        <LeadFormDialog
          open={open}
          onOpenChange={(next) => !next && closeAll()}
          strategies={strategies}
          onCreated={() => {
            closeAll();
            router.push("/comercial?tab=commercial");
          }}
        />
      )}

      {step === "despesa" && <ExpenseFormDialog open={open} onOpenChange={(next) => !next && closeAll()} />}

      {step === "venda" && !saleLead && (
        <Dialog open={open} onOpenChange={(next) => !next && closeAll()}>
          <DialogContent className="max-w-sm">
            <form onSubmit={handleSaleSubmit} className="flex flex-col gap-6">
              <DialogHeader>
                <DialogTitle>Nova venda</DialogTitle>
                <DialogDescription>Sem lead prévio — o próximo passo pergunta pontual ou recorrente e já gera cliente, contrato e operação juntos.</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="sale-name">Cliente / Empresa</Label>
                  <Input id="sale-name" value={saleName} onChange={(e) => setSaleName(e.target.value)} required autoFocus />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="sale-value">Valor (R$, opcional)</Label>
                  <Input id="sale-value" type="number" inputMode="decimal" value={saleValue} onChange={(e) => setSaleValue(e.target.value)} />
                </div>
              </div>
              {saleError && (
                <p role="alert" className="text-sm text-destructive">
                  {saleError}
                </p>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeAll}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Criando..." : "Continuar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {saleLead && (
        <OnboardingModal
          lead={saleLead}
          open={saleLead !== null}
          onOpenChange={(next) => !next && closeAll()}
          onSuccess={(clientId) => {
            closeAll();
            router.push(`/clientes/${clientId}`);
          }}
        />
      )}

      {step === "tarefa" && (
        <Dialog open={open} onOpenChange={(next) => !next && closeAll()}>
          <DialogContent className="max-w-sm">
            <form onSubmit={handleTaskSubmit} className="flex flex-col gap-6">
              <DialogHeader>
                <DialogTitle>Nova tarefa</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-2">
                <Label htmlFor="task-title">O que precisa ser feito?</Label>
                <textarea
                  id="task-title"
                  value={taskText}
                  onChange={(e) => setTaskText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleTaskSubmit(e as unknown as FormEvent);
                    }
                  }}
                  placeholder='"@eduardo atualizar CRM amanhã" — ou cole várias linhas ("Operacional:" + "Elenita: roteiro, reunião...")'
                  rows={taskText.includes("\n") ? Math.min(8, taskText.split("\n").length + 1) : 2}
                  required
                  autoFocus
                  className="resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
                {taskText.trim() && !taskText.includes("\n") && <p className="text-xs text-muted-foreground">{describeQuickTaskPreview(taskText, teamMembers, clients)}</p>}
                {taskText.includes("\n") && <p className="text-xs text-muted-foreground">Várias linhas — cada uma vira uma tarefa ao adicionar.</p>}
              </div>
              {taskError && (
                <p role="alert" className="text-sm text-destructive">
                  {taskError}
                </p>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeAll}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Criando..." : "Criar tarefa"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {step === "equipe" && (
        <Dialog open={open} onOpenChange={(next) => !next && closeAll()}>
          <DialogContent className="max-w-sm">
            {teamInvited ? (
              <div className="flex flex-col gap-6">
                <DialogHeader>
                  <DialogTitle>Convite criado</DialogTitle>
                  <DialogDescription>
                    Peça pra {teamName.split(" ")[0]} criar a conta em <span className="font-mono text-foreground">/admin/signup</span> usando o e-mail {teamEmail} — o cargo já vem certo.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button type="button" onClick={closeAll}>
                    Fechar
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <form onSubmit={handleTeamSubmit} className="flex flex-col gap-6">
                <DialogHeader>
                  <DialogTitle>Novo membro da equipe</DialogTitle>
                  <DialogDescription>A pessoa cria a própria senha depois, em /admin/signup — aqui só libera o e-mail.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="team-name">Nome</Label>
                    <Input id="team-name" value={teamName} onChange={(e) => setTeamName(e.target.value)} required autoFocus />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="team-email">E-mail</Label>
                    <Input id="team-email" type="email" value={teamEmail} onChange={(e) => setTeamEmail(e.target.value)} required />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="team-role">Cargo</Label>
                    <select
                      id="team-role"
                      value={teamRole}
                      onChange={(e) => setTeamRole(e.target.value as UserRole)}
                      className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      {(Object.keys(TEAM_ROLE_LABEL) as Array<keyof typeof TEAM_ROLE_LABEL>).map((role) => (
                        <option key={role} value={role}>
                          {TEAM_ROLE_LABEL[role]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {teamError && (
                  <p role="alert" className="text-sm text-destructive">
                    {teamError}
                  </p>
                )}
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={closeAll}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Convidando..." : "Convidar"}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
