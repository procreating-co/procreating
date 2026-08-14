"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Building2, CheckSquare2, Handshake, Plus, Receipt } from "lucide-react";
import { Command, CommandDialog, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LeadFormDialog } from "@/components/comercial/lead-form-dialog";
import { ExpenseFormDialog } from "@/components/financeiro/expense-form-dialog";
import { OnboardingModal } from "@/components/onboarding/onboarding-modal";
import { createWonLeadForSaleAction, listStrategiesAction } from "@/lib/comercial/actions";
import { createTaskAction } from "@/lib/tasks/actions";
import { useAdminUser } from "@/lib/admin/auth/auth-context";
import type { LeadWithRelations } from "@/lib/comercial/types";
import type { Strategy } from "@/lib/supabase/types/database";

type Step = "picker" | "lead" | "venda" | "despesa" | "tarefa";

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

  const [saleName, setSaleName] = useState("");
  const [saleValue, setSaleValue] = useState("");
  const [saleLead, setSaleLead] = useState<LeadWithRelations | null>(null);
  const [saleError, setSaleError] = useState<string | null>(null);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskError, setTaskError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (step === "lead" && strategies.length === 0) {
      listStrategiesAction().then(setStrategies);
    }
  }, [step, strategies.length]);

  function closeAll() {
    setOpen(false);
    setStep("picker");
    setSaleName("");
    setSaleValue("");
    setSaleLead(null);
    setSaleError(null);
    setTaskTitle("");
    setTaskError(null);
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
    if (!taskTitle.trim()) return;
    setTaskError(null);
    startTransition(async () => {
      const result = await createTaskAction({ title: taskTitle.trim(), assigneeId: user.id, dueDate: null, contextType: null, contextId: null });
      if (!result.ok) {
        setTaskError(result.error);
        return;
      }
      closeAll();
      router.refresh();
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
        description="Criar rapidamente um lead, venda, despesa ou tarefa"
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
            router.push("/comercial?tab=crm");
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
                <Label htmlFor="task-title">O quê?</Label>
                <Input id="task-title" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required autoFocus />
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
    </>
  );
}
