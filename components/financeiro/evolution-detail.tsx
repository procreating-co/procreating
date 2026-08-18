"use client";

import { useState } from "react";
import Link from "next/link";
import { Wallet } from "lucide-react";
import { RevenueChart } from "@/components/financeiro/revenue-chart";
import { EmptyInline } from "@/components/dashboard/empty-inline";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMonthKeyLong } from "@/lib/date";
import type { MonthlyEvolutionPoint } from "@/lib/financeiro/types";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/**
 * Conteúdo ampliado do gráfico "Evolução" — pedido explícito: "ao clicar no mês eu quero ver de
 * onde saiu esse faturamento, mostrando os clientes e vendas do mês". Cada linha da tabela é
 * clicável (mesmo padrão de `leads-table.tsx`) e abre um modal com o breakdown por cliente —
 * `revenueByClient` já vem pronto de `computeFinanceiroMetrics` (é o mesmo dado que já alimenta o
 * hover do gráfico), nenhuma query nova.
 */
export function EvolutionDetail({ data }: { data: MonthlyEvolutionPoint[] }) {
  const [selectedMonth, setSelectedMonth] = useState<MonthlyEvolutionPoint | null>(null);
  // `data` chega do mais antigo pro mais recente (é como o gráfico precisa ler, cronológico da
  // esquerda pra direita) — a TABELA é o inverso: mês atual primeiro, mais antigo por último,
  // rolando pra baixo (pedido explícito), então só a lista da tabela é invertida aqui.
  const rowsNewestFirst = [...data].reverse();

  return (
    <div className="flex flex-col gap-5">
      <RevenueChart data={data} height={360} />
      {data.length === 0 ? (
        <EmptyInline icon={Wallet} label="Sem dado suficiente." />
      ) : (
        <div className="max-h-96 overflow-y-auto overflow-x-auto rounded-xl border border-border/60">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead>Mês</TableHead>
                <TableHead className="text-right">Receita</TableHead>
                <TableHead className="text-right">Despesas</TableHead>
                <TableHead className="text-right">Líquido</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rowsNewestFirst.map((point) => (
                <TableRow key={point.month} className="cursor-pointer border-border/60" onClick={() => setSelectedMonth(point)}>
                  <TableCell className="font-medium underline-offset-4 hover:underline">{formatMonthKeyLong(point.month)}</TableCell>
                  <TableCell className="text-right tabular-nums">{currency.format(point.revenue)}</TableCell>
                  <TableCell className="text-right tabular-nums">{currency.format(point.expenses)}</TableCell>
                  <TableCell className="text-right tabular-nums">{currency.format(point.revenue - point.expenses)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={selectedMonth !== null} onOpenChange={(open) => !open && setSelectedMonth(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedMonth ? formatMonthKeyLong(selectedMonth.month) : ""}</DialogTitle>
            <DialogDescription>De onde saiu a receita do mês, por cliente.</DialogDescription>
          </DialogHeader>
          {selectedMonth && selectedMonth.revenueByClient.length === 0 ? (
            <EmptyInline icon={Wallet} label="Nenhuma receita neste mês." />
          ) : (
            <ul className="flex max-h-80 flex-col divide-y divide-border/60 overflow-y-auto rounded-lg border border-border/60">
              {selectedMonth?.revenueByClient.map((entry) => (
                <li key={entry.clientId ?? entry.clientName} className="flex items-center justify-between gap-4 px-3.5 py-2.5 text-sm">
                  {entry.clientId ? (
                    <Link href={`/clientes/${entry.clientId}`} className="min-w-0 flex-1 truncate underline-offset-2 hover:underline" title="Ver ficha do cliente">
                      {entry.clientName}
                    </Link>
                  ) : (
                    <span className="min-w-0 flex-1 truncate text-muted-foreground">{entry.clientName}</span>
                  )}
                  <span className="shrink-0 tabular-nums text-muted-foreground">{currency.format(entry.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
