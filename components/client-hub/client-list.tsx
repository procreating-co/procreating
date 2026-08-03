"use client";

import { useRouter } from "next/navigation";
import { SearchX } from "lucide-react";
import { CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { ClientRow } from "@/components/client-hub/client-row";
import type { LauncherClient } from "@/lib/clients/launcher-mock-data";

/**
 * Filtragem em si é do `Command` (cmdk) — compara `value` de cada `CommandItem` contra o texto
 * do `SearchBar` sozinho, instantâneo, sem estado próprio aqui. Entrada escalonada (stagger) via
 * CSS puro (`animate-in`, já disponível — `tw-animate-css`), não Framer Motion, de propósito:
 * envolver `CommandItem` num `motion.div` arriscaria atrapalhar como o cmdk acha os itens no DOM
 * pra navegação por teclado.
 */
export function ClientList({ clients }: { clients: LauncherClient[] }) {
  const router = useRouter();

  return (
    <CommandList>
      <CommandEmpty className="flex flex-col items-center gap-2 py-12 text-center">
        <SearchX className="size-5 text-muted-foreground/60" />
        <p className="text-sm text-foreground">No clients found</p>
        <p className="text-xs text-muted-foreground">Try a different search, or create a new client below.</p>
      </CommandEmpty>
      <CommandGroup>
        {clients.map((client, index) => (
          <CommandItem
            key={client.slug}
            value={client.name}
            onSelect={() => router.push(`/clients/${client.slug}`)}
            className="animate-in fade-in slide-in-from-bottom-1 fill-mode-backwards"
            style={{ animationDelay: `${index * 40}ms`, animationDuration: "300ms" }}
          >
            <ClientRow client={client} />
          </CommandItem>
        ))}
      </CommandGroup>
    </CommandList>
  );
}
