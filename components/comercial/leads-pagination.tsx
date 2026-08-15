import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Paginação real (servidor, `?page=`) — não esconde nada em memória, cada página é uma query nova
 * (`listOpenLeadsPaginated`, `lib/comercial/queries.ts`). Link real, não botão+state, pelo mesmo
 * motivo de todo filtro do projeto: sobrevive a refresh/compartilhar URL/voltar do navegador.
 */
export function LeadsPagination({
  page,
  pageSize,
  totalCount,
  ownerId,
  strategyId,
  listId,
}: {
  page: number;
  pageSize: number;
  totalCount: number;
  ownerId: string;
  strategyId: string;
  listId: string;
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  if (totalCount === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);

  function href(targetPage: number) {
    const params = new URLSearchParams({ tab: "crm", view: "lista" });
    if (ownerId !== "todos") params.set("owner", ownerId);
    if (strategyId !== "todos") params.set("strategy", strategyId);
    if (listId !== "todos") params.set("list", listId);
    if (targetPage > 1) params.set("page", String(targetPage));
    return `/comercial?${params.toString()}`;
  }

  return (
    <div className="flex items-center justify-between text-xs text-muted-foreground">
      <span>
        Mostrando {from}–{to} de {totalCount}
      </span>
      <div className="flex items-center gap-1">
        <Link
          href={href(page - 1)}
          aria-disabled={page <= 1}
          className={cn("flex size-7 items-center justify-center rounded-md border border-border/60 transition-colors", page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-foreground/5 hover:text-foreground")}
        >
          <ChevronLeft className="size-3.5" />
        </Link>
        <span className="px-2 tabular-nums">
          {page} / {totalPages}
        </span>
        <Link
          href={href(page + 1)}
          aria-disabled={page >= totalPages}
          className={cn("flex size-7 items-center justify-center rounded-md border border-border/60 transition-colors", page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-foreground/5 hover:text-foreground")}
        >
          <ChevronRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
