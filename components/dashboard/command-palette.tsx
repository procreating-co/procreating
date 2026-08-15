"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, CheckSquare2, FileText, Handshake, ListChecks, Receipt, Search, Settings, Sun, Target, TrendingUp, Wallet, type LucideIcon } from "lucide-react";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { searchCommandPaletteAction, type CommandPaletteResults } from "@/lib/command-palette/search";
import { createTaskAction } from "@/lib/tasks/actions";
import { parseQuickTask } from "@/lib/tasks/quick-parse";
import { createLeadAction, createStrategyAction } from "@/lib/comercial/actions";
import { listTeamUsersAction } from "@/lib/operacao/actions";
import { useAdminUser } from "@/lib/admin/auth/auth-context";
import type { User } from "@/lib/supabase/types/database";
import { cn } from "@/lib/utils";

type QuickNavItem = { label: string; href: string; icon: LucideIcon };

/** Navegação estática — não é toda a árvore de `nav-config.ts`, só os destinos mais usados
 *  (evita uma lista de 30 itens idênticos; um clique a mais pra algo raro é aceitável). */
const QUICK_NAV: QuickNavItem[] = [
  { label: "Workspace", href: "/workspace", icon: Sun },
  { label: "Comercial", href: "/comercial", icon: TrendingUp },
  { label: "Pipeline", href: "/comercial?tab=crm", icon: Handshake },
  { label: "Prospecção / Importar lista", href: "/comercial?tab=prospeccao", icon: ListChecks },
  { label: "Nova proposta", href: "/comercial?tab=crm", icon: FileText },
  { label: "Planejamento", href: "/comercial?tab=planejamento", icon: TrendingUp },
  { label: "Clientes", href: "/clientes", icon: Building2 },
  { label: "Financeiro", href: "/financeiro", icon: Wallet },
  { label: "Configurações", href: "/configuracoes", icon: Settings },
];

/**
 * ⌘K / Ctrl+K global — montado uma vez em `app/(internal)/layout.tsx` (nunca em `/admin` nem
 * `/clients`). Busca real em clientes/leads/tarefas/estratégias/despesas/custos
 * (`searchCommandPaletteAction`, debounced) + navegação rápida estática quando a busca está
 * vazia. Criação rápida embutida só pra Tarefa/Lead/Estratégia — os únicos fluxos do produto que
 * cabem num "digitou, enter" (1 campo obrigatório); o resto (Cliente, Despesa, Custo, Orçamento —
 * todos exigem campo demais, um wizard, ou (Orçamento) escolher primeiro QUAL lead) continua
 * navegando pra tela onde a criação já existe, em vez de duplicar UI. Cobre a lista do master
 * prompt §60 (Create task/opportunity/proposal, Import list, Start sequence, Search client/lead,
 * Go to Growth/Commercial/Planning/Finance) — "Import list"/"Start sequence" convergem no mesmo
 * lugar (aba Prospecção já é as duas coisas: motor de listas + fila de execução).
 */
export function CommandPalette() {
  const router = useRouter();
  const user = useAdminUser();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CommandPaletteResults>({ clients: [], leads: [], tasks: [], strategies: [], expenses: [], costs: [] });
  const [isPending, startTransition] = useTransition();
  const [isCreating, startCreateTransition] = useTransition();
  const [createError, setCreateError] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Só carrega ao abrir de verdade (não no mount de todo `layout.tsx`) — "Criar tarefa" com
  // `@mention` (mesmo parser de `WorkspaceTasks`/`QuickAddMenu`) precisa da lista de responsáveis.
  useEffect(() => {
    if (open && teamMembers.length === 0) {
      listTeamUsersAction().then(setTeamMembers);
    }
  }, [open, teamMembers.length]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        setResults(await searchCommandPaletteAction(query));
      });
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router],
  );

  // Criação rápida — só Tarefa e Lead têm formato "um campo, enter" (o resto exige campo demais
  // pra caber aqui, ver o plano). Ao contrário de `navigate`, NÃO troca de tela — cria e fica
  // onde o usuário estava, `router.refresh()` só pra revalidar o que já estiver visível.
  const createTask = useCallback(
    (rawText: string) => {
      setCreateError(null);
      const parsed = parseQuickTask(rawText, teamMembers);
      if (!parsed.title) {
        setCreateError("A tarefa ficou sem título depois de tirar data/hora/responsável — reescreva.");
        return;
      }
      startCreateTransition(async () => {
        const result = await createTaskAction({
          title: parsed.title,
          assigneeId: parsed.assigneeId ?? user.id,
          dueDate: parsed.dueDate,
          dueTime: parsed.dueTime,
          contextType: null,
          contextId: null,
        });
        if (!result.ok) {
          setCreateError(result.error);
          return;
        }
        setOpen(false);
        setQuery("");
        router.refresh();
      });
    },
    [router, user.id, teamMembers],
  );

  const createLead = useCallback(
    (companyName: string) => {
      setCreateError(null);
      startCreateTransition(async () => {
        const result = await createLeadAction({
          companyName,
          contactName: "",
          roleTitle: "",
          whatsapp: "",
          email: "",
          source: "",
          strategyId: null,
          potentialValue: null,
          notes: "",
        });
        if (!result.ok) {
          setCreateError(result.error);
          return;
        }
        setOpen(false);
        setQuery("");
        router.refresh();
      });
    },
    [router],
  );

  const createStrategy = useCallback(
    (name: string) => {
      setCreateError(null);
      startCreateTransition(async () => {
        const result = await createStrategyAction({
          name,
          targetAudience: "",
          segment: "",
          location: "",
          icp: "",
          qualificationCriteria: "",
          offer: "",
          salesPitch: "",
          prospectingChannel: "",
          prospectingGoal: null,
          meetingsGoal: null,
          closingGoal: null,
          revenueGoal: null,
        });
        if (!result.ok) {
          setCreateError(result.error);
          return;
        }
        setOpen(false);
        setQuery("");
        router.refresh();
      });
    },
    [router],
  );

  const hasQuery = query.trim().length > 0;
  const hasResults =
    results.clients.length > 0 ||
    results.leads.length > 0 ||
    results.tasks.length > 0 ||
    results.strategies.length > 0 ||
    results.expenses.length > 0 ||
    results.costs.length > 0;

  return (
    <>
      {/* Só a lupa — era um pill com "Buscar... ⌘K" escrito; o atalho de teclado continua
       *  funcionando (listener global logo abaixo), só parou de precisar de texto pra ser
       *  descoberto (`title`/`aria-label` cobrem isso). */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buscar (⌘K)"
        title="Buscar (⌘K)"
        className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
      >
        <Search className="size-4" />
      </button>

      <CommandDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setCreateError(null);
        }}
        title="Buscar"
        description="Buscar clientes, leads, tarefas, estratégias, despesas e custos"
        shouldFilter={false}
      >
        <CommandInput
          placeholder="Buscar ou criar..."
          value={query}
          onValueChange={(value) => {
            setQuery(value);
            setCreateError(null);
          }}
        />
        <CommandList>
          {hasQuery && !isPending && !hasResults && !createError && <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>}
          {createError && <CommandEmpty className="text-destructive">{createError}</CommandEmpty>}

          {!hasQuery && (
            <CommandGroup heading="Navegação rápida">
              {QUICK_NAV.map((item) => (
                <CommandItem key={item.href} onSelect={() => navigate(item.href)}>
                  <item.icon className="size-4 text-muted-foreground" />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {hasQuery && (
            <CommandGroup heading="Ações rápidas">
              <CommandItem disabled={isCreating} onSelect={() => createTask(query.trim())}>
                <CheckSquare2 className="size-4 text-muted-foreground" />
                Criar tarefa &ldquo;{query.trim()}&rdquo;
              </CommandItem>
              <CommandItem disabled={isCreating} onSelect={() => createLead(query.trim())}>
                <Handshake className="size-4 text-muted-foreground" />
                Criar lead &ldquo;{query.trim()}&rdquo;
              </CommandItem>
              <CommandItem disabled={isCreating} onSelect={() => createStrategy(query.trim())}>
                <Target className="size-4 text-muted-foreground" />
                Criar estratégia &ldquo;{query.trim()}&rdquo;
              </CommandItem>
            </CommandGroup>
          )}

          {results.clients.length > 0 && (
            <CommandGroup heading="Clientes">
              {results.clients.map((client) => (
                <CommandItem key={client.id} onSelect={() => navigate(`/clientes/${client.id}`)}>
                  <Building2 className="size-4 text-muted-foreground" />
                  {client.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.leads.length > 0 && (
            <CommandGroup heading="Leads">
              {results.leads.map((lead) => (
                <CommandItem key={lead.id} onSelect={() => navigate("/comercial?tab=crm")}>
                  <Handshake className="size-4 text-muted-foreground" />
                  {lead.company_name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.tasks.length > 0 && (
            <CommandGroup heading="Tarefas">
              {results.tasks.map((task) => (
                <CommandItem key={task.id} onSelect={() => navigate("/workspace")}>
                  <CheckSquare2 className="size-4 text-muted-foreground" />
                  {task.title}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.strategies.length > 0 && (
            <CommandGroup heading="Estratégias">
              {results.strategies.map((strategy) => (
                <CommandItem key={strategy.id} onSelect={() => navigate(`/comercial/estrategias/${strategy.id}`)}>
                  <Target className="size-4 text-muted-foreground" />
                  {strategy.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.expenses.length > 0 && (
            <CommandGroup heading="Despesas">
              {results.expenses.map((expense) => (
                <CommandItem key={expense.id} onSelect={() => navigate("/financeiro?tab=payables&status=todas")}>
                  <Receipt className="size-4 text-muted-foreground" />
                  {expense.description}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.costs.length > 0 && (
            <CommandGroup heading="Custos">
              {results.costs.map((cost) => (
                <CommandItem key={cost.id} onSelect={() => navigate("/financeiro?tab=costs")}>
                  <Wallet className="size-4 text-muted-foreground" />
                  {cost.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
