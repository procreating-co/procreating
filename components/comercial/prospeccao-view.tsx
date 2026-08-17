"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ListImportDrawer } from "@/components/comercial/list-import-drawer";
import { deleteProspectingListAction, renameProspectingListAction } from "@/lib/comercial/actions";
import type { ProspectingList } from "@/lib/supabase/types/database";
import type { Strategy } from "@/lib/supabase/types/database";

const LIST_STATUS_LABEL: Record<ProspectingList["status"], string> = {
  em_prospeccao: "Em prospecção",
  pausada: "Pausada",
  concluida: "Concluída",
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });

/**
 * Prospecção — o motor de listas mora aqui. Cada lista é um card (nome, origem, contagem,
 * estratégia, status) que leva pro CRM já filtrado por ela (`?tab=commercial&list=id`) — não existe uma
 * página própria de "detalhe da lista", o CRM (Pipeline/Lista) já É essa visão, só filtrada
 * (princípio "AGLUTINE", seção 2 do prompt).
 *
 * "ERP totalmente funcional" — antes só dava pra criar (import de CSV); renomear ou excluir uma
 * lista exigia ir direto no banco. O card virou `<div onClick>` em vez de `<Link>` porque HTML não
 * permite `<button>` dentro de `<a>` — mesmo motivo já resolvido em `LeadCard`
 * (`pipeline-board.tsx`): navegação e ações vivem lado a lado, não uma dentro da outra.
 */
export function ProspeccaoView({ lists, strategies }: { lists: ProspectingList[]; strategies: Strategy[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [importing, setImporting] = useState(false);
  const [renamingList, setRenamingList] = useState<ProspectingList | null>(null);
  const [deletingList, setDeletingList] = useState<ProspectingList | null>(null);
  const strategyById = new Map(strategies.map((strategy) => [strategy.id, strategy]));

  // Atalho "I" (`KeyboardShortcuts`, §61) — navega pra cá com `?import=1` e a URL é o canal (mesmo
  // padrão de `?tab=`/`?period=` já usado em todo o produto), não um evento/estado global novo. Abre
  // o drawer sozinho e some com o parâmetro (não deixar `?import=1` na URL depois de já ter aberto,
  // senão um refresh reabriria o drawer sem o usuário pedir).
  useEffect(() => {
    if (searchParams.get("import") !== "1") return;
    setImporting(true);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("import");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Listas importadas — clique numa lista pra ver os leads dela no CRM.</p>
        <Button type="button" onClick={() => setImporting(true)} className="gap-2">
          <Plus className="size-4" />
          Importar lista
        </Button>
      </div>

      {lists.length === 0 ? (
        <div
          onClick={() => setImporting(true)}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 px-6 py-16 text-center text-muted-foreground hover:border-border"
        >
          <p className="text-sm">Nenhuma lista importada ainda.</p>
          <p className="text-xs">Solte um CSV pra começar a prospecção ativa.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => {
            const strategy = list.strategy_id ? strategyById.get(list.strategy_id) : undefined;
            return (
              <div
                key={list.id}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/comercial?tab=commercial&list=${list.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") router.push(`/comercial?tab=commercial&list=${list.id}`);
                }}
                className="group relative flex cursor-pointer flex-col gap-3 rounded-xl border border-border/60 bg-card/20 p-4 transition-colors hover:border-border hover:bg-card/40"
              >
                <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRenamingList(list);
                    }}
                    aria-label={`Renomear ${list.name}`}
                    className="rounded p-1 text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingList(list);
                    }}
                    aria-label={`Excluir ${list.name}`}
                    className="rounded p-1 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <div className="flex items-start justify-between gap-2 pr-10">
                  <p className="text-sm font-medium">{list.name}</p>
                  <span className="shrink-0 rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">{LIST_STATUS_LABEL[list.status]}</span>
                </div>
                <p className="text-2xl font-semibold tabular-nums">{list.lead_count}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{strategy ? strategy.name : "Sem estratégia"}</span>
                  <span>{dateFormatter.format(new Date(list.created_at))}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ListImportDrawer open={importing} onOpenChange={setImporting} strategies={strategies} />
      {renamingList && <RenameListDialog key={renamingList.id} list={renamingList} open onOpenChange={(open) => !open && setRenamingList(null)} />}
      <DeleteListConfirm list={deletingList} onOpenChange={(open) => !open && setDeletingList(null)} />
    </div>
  );
}

function RenameListDialog({ list, open, onOpenChange }: { list: ProspectingList; open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [name, setName] = useState(list.name);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await renameProspectingListAction(list.id, name);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>Renomear lista</DialogTitle>
            <DialogDescription>Só o nome muda — leads e contagem continuam os mesmos.</DialogDescription>
          </DialogHeader>
          <Input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteListConfirm({ list, onOpenChange }: { list: ProspectingList | null; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    if (!list) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteProspectingListAction(list.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <ConfirmDialog
      open={list !== null}
      onOpenChange={(open) => {
        if (!open) setError(null);
        onOpenChange(open);
      }}
      title="Excluir lista?"
      description={error ?? (list ? `"${list.name}" some pra sempre — não dá pra desfazer. Só funciona se não houver leads vinculados a ela.` : undefined)}
      isPending={isPending}
      onConfirm={handleConfirm}
    />
  );
}
