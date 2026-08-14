"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, CheckSquare2, Handshake, Receipt, Search, Settings, Sun, Target, TrendingUp, Wallet, type LucideIcon } from "lucide-react";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { searchCommandPaletteAction, type CommandPaletteResults } from "@/lib/command-palette/search";
import { createTaskAction } from "@/lib/tasks/actions";
import { createLeadAction, createStrategyAction } from "@/lib/comercial/actions";
import { useAdminUser } from "@/lib/admin/auth/auth-context";
import { cn } from "@/lib/utils";

type QuickNavItem = { label: string; href: string; icon: LucideIcon };

/** Navegação estática — não é toda a árvore de `nav-config.ts`, só os destinos mais usados
 *  (evita uma lista de 30 itens idênticos; um clique a mais pra algo raro é aceitável). */
const QUICK_NAV: QuickNavItem[] = [
  { label: "Meu Dia", href: "/meu-dia", icon: Sun },
  { label: "Pipeline", href: "/comercial/pipeline", icon: Handshake },
  { label: "Simuladores", href: "/marketing/simuladores", icon: TrendingUp },
  { label: "Clientes", href: "/clientes", icon: Building2 },
  { label: "Financeiro", href: "/financeiro", icon: Wallet },
  { label: "Configurações", href: "/configuracoes", icon: Settings },
];

/**
 * ⌘K / Ctrl+K global — montado uma vez em `app/(internal)/layout.tsx` (nunca em `/admin` nem
 * `/clients`). Busca real em clientes/leads/tarefas/estratégias/despesas/custos
 * (`searchCommandPaletteAction`, debounced) + navegação rápida estática quando a busca está
 * vazia. Criação rápida embutida só pra Tarefa/Lead/Estratégia — os únicos fluxos do produto que
 * cabem num "digitou, enter" (1 campo obrigatório); o resto (Cliente, Despesa, Custo — todos
 * exigem campo demais ou um wizard) continua navegando pra tela onde a criação já existe, em vez
 * de duplicar UI.
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
    (title: string) => {
      setCreateError(null);
      startCreateTransition(async () => {
        const result = await createTaskAction({ title, assigneeId: user.id, dueDate: null, contextType: null, contextId: null });
        if (!result.ok) {
          setCreateError(result.error);
          return;
        }
        setOpen(false);
        setQuery("");
        router.refresh();
      });
    },
    [router, user.id],
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
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-8 gap-2 px-2.5 text-muted-foreground sm:px-3"
      >
        <Search className="size-3.5" />
        <span className="hidden sm:inline">Buscar...</span>
        <CommandShortcut className="hidden rounded border border-border/60 bg-muted px-1.5 py-0.5 font-mono text-[10px] sm:inline">⌘K</CommandShortcut>
      </Button>

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
                <CommandItem key={lead.id} onSelect={() => navigate("/comercial/pipeline")}>
                  <Handshake className="size-4 text-muted-foreground" />
                  {lead.company_name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.tasks.length > 0 && (
            <CommandGroup heading="Tarefas">
              {results.tasks.map((task) => (
                <CommandItem key={task.id} onSelect={() => navigate("/meu-dia")}>
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
                <CommandItem key={expense.id} onSelect={() => navigate("/financeiro/despesas")}>
                  <Receipt className="size-4 text-muted-foreground" />
                  {expense.description}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.costs.length > 0 && (
            <CommandGroup heading="Custos">
              {results.costs.map((cost) => (
                <CommandItem key={cost.id} onSelect={() => navigate("/financeiro/custos")}>
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
