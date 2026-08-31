"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { compareMonthKeys, formatMonthKeyLong, shiftMonthKey } from "@/lib/date";

/** Alcance da navegação — 2 anos pra cada lado. Sem limite nenhum a leitura de um mês vazio já é
 *  correta (mostra R$0, não quebra), mas um alcance sem fim convida a clicar até um mês sem
 *  significado nenhum (2040?); 24 é generoso pra qualquer uso real do negócio e evita esse
 *  passeio sem propósito. Botão desabilita visualmente no limite — não é possível clicar além. */
const MAX_MONTHS_RANGE = 24;

/**
 * Navegação de mês do Dashboard (◀▶) — controla via query string (`?month=MM/YYYY`), mesmo
 * padrão de `period-select.tsx`: o Server Component (`app/(internal)/page.tsx`) lê `searchParams`
 * e recalcula os KPIs pro mês escolhido (`computeDashboardMonthKpis`), nunca duplicando fetch
 * aqui. `todayMonthKey`/`isFuture` vêm como prop, calculados no servidor — nunca `new Date()`/
 * `currentMonthKey()` no cliente (mesmo raciocínio de `dashboard-date-header.tsx`: evitaria um
 * mismatch de hidratação se o relógio do servidor e o do navegador discordarem por um instante
 * bem em cima da virada do mês).
 */
export function MonthKpiNavigator({ monthKey, todayMonthKey, isFuture }: { monthKey: string; todayMonthKey: string; isFuture: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isCurrent = monthKey === todayMonthKey;
  const distanceFromToday = compareMonthKeys(monthKey, todayMonthKey);
  const canGoBack = distanceFromToday > -MAX_MONTHS_RANGE;
  const canGoForward = distanceFromToday < MAX_MONTHS_RANGE;

  function navigateTo(nextMonthKey: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextMonthKey === todayMonthKey) params.delete("month");
    else params.set("month", nextMonthKey);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 rounded-md border border-border/60 px-1 py-1">
        <button
          type="button"
          onClick={() => navigateTo(shiftMonthKey(monthKey, -1))}
          disabled={!canGoBack}
          aria-label="Mês anterior"
          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="min-w-28 text-center text-sm font-medium tabular-nums">{formatMonthKeyLong(monthKey)}</span>
        <button
          type="button"
          onClick={() => navigateTo(shiftMonthKey(monthKey, 1))}
          disabled={!canGoForward}
          aria-label="Próximo mês"
          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {!isCurrent && (
        <button
          type="button"
          onClick={() => navigateTo(todayMonthKey)}
          className="flex items-center gap-1 rounded-full border border-border/60 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <RotateCcw className="size-3" />
          Hoje
        </button>
      )}

      {isFuture && <StatusBadge tone="info" label="Projeção" />}
    </div>
  );
}
