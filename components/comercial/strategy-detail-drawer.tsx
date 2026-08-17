"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Pencil, Target, TrendingUp, Users, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { StrategyFormDialog } from "@/components/comercial/strategy-form-dialog";
import { FunnelChart } from "@/components/comercial/funnel-chart";
import { SequenceEditor } from "@/components/comercial/sequence-editor";
import { StatTile } from "@/components/dashboard/stat-tile";
import type { Strategy, StrategyFunnel } from "@/lib/comercial/types";
import type { SequenceStep } from "@/lib/supabase/types/database";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export type StrategyDetailData = { strategy: Strategy; funnel: StrategyFunnel; sequenceSteps: SequenceStep[] };

/**
 * §2/§4/§20 passo 5 (o de maior risco da lista, liberado só depois de teste manual dos passos
 * 1-4) — `/comercial/estrategias/[id]` (rota própria) vira este drawer, aberto por
 * `?strategyDetail=<id>` (NÃO `?strategy=`, que já é o filtro de estratégia do CRM — mesmo nome
 * pros dois teria feito o filtro abrir o drawer sozinho por engano). A rota antiga agora só
 * redireciona pra cá — link salvo/compartilhado continua funcionando.
 *
 * Diferente de `?panel=`/`?import=1` (que se auto-removem da URL depois de abrir, são gatilhos de
 * um tiro só): `?strategyDetail=` fica na URL enquanto o drawer está aberto — é o que substitui a
 * rota própria de antes, precisa continuar compartilhável/atualizável (F5 mantém o drawer aberto
 * na mesma estratégia). Fechar remove o parâmetro via `router.push`, não um `open` local — a URL
 * continua sendo a fonte de verdade, mesmo padrão do resto do produto.
 *
 * `data === null` quando `getStrategy` não encontrou nada (id inválido/removido) — não renderiza
 * nada, o comportamento antigo (`notFound()`) não faz sentido dentro de um drawer sobre uma tela
 * que continua válida por trás.
 */
export function StrategyDetailDrawer({ data }: { data: StrategyDetailData | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [editing, setEditing] = useState(false);

  function close() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("strategyDetail");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  if (!data) return null;
  const { strategy, funnel, sequenceSteps } = data;

  const fields: { label: string; value: string | null }[] = [
    { label: "Segmento", value: strategy.segment },
    { label: "Localização", value: strategy.location },
    { label: "Canal de prospecção", value: strategy.prospecting_channel },
    { label: "ICP", value: strategy.icp },
    { label: "Critérios de qualificação", value: strategy.qualification_criteria },
    { label: "Oferta", value: strategy.offer },
    { label: "Argumentos comerciais", value: strategy.sales_pitch },
  ].filter((field) => field.value);

  const conversionRate = funnel.totalLeads > 0 ? funnel.wonLeads / funnel.totalLeads : null;

  return (
    <>
      <Sheet open onOpenChange={(next) => !next && close()}>
        <SheetContent side="right" className="w-full gap-0 overflow-y-auto bg-popover p-6 text-popover-foreground sm:max-w-2xl">
          <div className="flex flex-col gap-8">
            <div className="flex items-start justify-between gap-4 pr-6">
              <div className="flex flex-col gap-1">
                <SheetTitle className="font-display text-2xl">{strategy.name}</SheetTitle>
                {strategy.target_audience && <SheetDescription>{strategy.target_audience}</SheetDescription>}
              </div>
              <Button type="button" variant="outline" size="sm" className="shrink-0 gap-2" onClick={() => setEditing(true)}>
                <Pencil className="size-3.5" />
                Editar
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatTile demo={false} label="Leads" value={String(funnel.totalLeads)} icon={<Users className="size-4.5" />} tone="info" />
              <StatTile demo={false} label="Fechados" value={String(funnel.wonLeads)} icon={<Target className="size-4.5" />} tone="success" />
              <StatTile
                demo={false}
                label="Conversão lead → fechado"
                value={conversionRate != null ? `${(conversionRate * 100).toFixed(0)}%` : "—"}
                icon={<TrendingUp className="size-4.5" />}
                tone="success"
              />
              <StatTile
                demo={false}
                label="Ticket médio"
                value={funnel.averageTicket != null ? currencyFormatter.format(funnel.averageTicket) : "—"}
                icon={<Wallet className="size-4.5" />}
                tone="brand"
              />
            </div>

            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Funil</h2>
                <span className="text-xs text-muted-foreground">Receita total contratada: {currencyFormatter.format(funnel.totalRevenue)}</span>
              </div>
              <div className="rounded-xl border border-border/60 bg-card/40 p-5">
                {funnel.totalLeads === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">Nenhum lead vinculado a esta estratégia ainda.</p>
                ) : (
                  <FunnelChart steps={funnel.steps} />
                )}
              </div>
            </section>

            {fields.length > 0 && (
              <section className="flex flex-col gap-4">
                <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Detalhes</h2>
                <div className="grid grid-cols-1 gap-4 rounded-xl border border-border/60 bg-card/40 p-5 sm:grid-cols-2">
                  {fields.map((field) => (
                    <div key={field.label} className="flex flex-col gap-1">
                      <p className="text-xs text-muted-foreground">{field.label}</p>
                      <p className="text-sm">{field.value}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Cadência</h2>
                <p className="text-sm text-muted-foreground">Sequência de contato pra leads dessa estratégia — alimenta a fila de execução em Prospecção.</p>
              </div>
              <SequenceEditor strategyId={strategy.id} steps={sequenceSteps} />
            </section>
          </div>
        </SheetContent>
      </Sheet>

      <StrategyFormDialog open={editing} onOpenChange={setEditing} strategy={strategy} />
    </>
  );
}
