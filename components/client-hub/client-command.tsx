"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Command } from "@/components/ui/command";
import { SearchBar } from "@/components/client-hub/search-bar";
import { ClientList } from "@/components/client-hub/client-list";
import { NewClientDialog } from "@/components/client-hub/new-client-dialog";
import type { ClientWorkspaceConfig } from "@/lib/clients/workspace-registry";

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

/**
 * Orquestrador da página `/clients` — dono do estado de busca (repassado pro `SearchBar`/
 * `Command`) e do handler de Esc (cmdk já cobre ↑/↓/Enter sozinho; Esc não tem opinião própria
 * no cmdk fora de um Dialog, então tratamos na mão: limpa a busca, ou tira o foco se já tiver
 * vazia — mesmo comportamento do Raycast).
 */
export function ClientCommand({ clients }: { clients: ClientWorkspaceConfig[] }) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (search) {
        setSearch("");
      } else {
        (document.activeElement as HTMLElement | null)?.blur();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [search]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[700px] flex-col justify-center px-6 py-16">
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="mb-8 text-center"
      >
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Procreating</p>
        <h1 className="font-display text-4xl text-foreground">Client Workspace</h1>
        <p className="mt-2 text-sm text-muted-foreground">Select an existing workspace or create a new one.</p>
      </motion.div>

      <motion.div
        {...fadeUp}
        transition={{ duration: 0.35, delay: 0.08, ease: "easeOut" }}
        className="overflow-hidden rounded-xl border border-border/60 bg-card/40 shadow-sm"
      >
        <Command>
          <SearchBar value={search} onValueChange={setSearch} />
          <ClientList clients={clients} />
        </Command>
      </motion.div>

      <motion.div {...fadeUp} transition={{ duration: 0.35, delay: 0.16, ease: "easeOut" }} className="mt-3">
        <NewClientDialog />
      </motion.div>
    </main>
  );
}
