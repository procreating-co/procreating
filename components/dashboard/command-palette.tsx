"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, CheckSquare2, Handshake, Search, Settings, Sun, TrendingUp, Wallet, type LucideIcon } from "lucide-react";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { searchCommandPaletteAction, type CommandPaletteResults } from "@/lib/command-palette/search";
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
 * `/clients`). Busca real em clientes/leads/tarefas (`searchCommandPaletteAction`, debounced) +
 * navegação rápida estática quando a busca está vazia. Sem fluxo de criação embutido — "Create
 * Client"/"Create Task" etc. navegam pra tela onde a criação já existe, em vez de duplicar UI.
 */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CommandPaletteResults>({ clients: [], leads: [], tasks: [] });
  const [isPending, startTransition] = useTransition();
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

  const hasQuery = query.trim().length > 0;
  const hasResults = results.clients.length > 0 || results.leads.length > 0 || results.tasks.length > 0;

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

      <CommandDialog open={open} onOpenChange={setOpen} title="Buscar" description="Buscar clientes, leads e tarefas" shouldFilter={false}>
        <CommandInput placeholder="Buscar qualquer coisa..." value={query} onValueChange={setQuery} />
        <CommandList>
          {hasQuery && !isPending && !hasResults && <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>}

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
                <CommandItem key={task.id} onSelect={() => navigate("/meu-dia/tarefas")}>
                  <CheckSquare2 className="size-4 text-muted-foreground" />
                  {task.title}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
