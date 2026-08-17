"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StrategyFormDialog } from "@/components/comercial/strategy-form-dialog";
import { EmptyState } from "@/components/dashboard/empty-state";
import { EmptyInline } from "@/components/dashboard/empty-inline";
import type { Strategy } from "@/lib/comercial/types";

/** `onSelectStrategy` opcional — quando fornecido (dentro do `StrategiesPanelSheet`, §2/§4/§20),
 *  clicar num card chama isto em vez de navegar por `<Link>` — o painel se fecha e abre o drawer
 *  de detalhe no lugar certo, orquestrado por quem já é dono do `open` do painel. Sem o prop
 *  (uso avulso, se algum dia existir), continua um `<Link>` normal pra rota antiga. */
export function StrategiesList({ strategies, onSelectStrategy }: { strategies: Strategy[]; onSelectStrategy?: (strategyId: string) => void }) {
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return strategies;
    return strategies.filter(
      (strategy) => strategy.name.toLowerCase().includes(normalized) || (strategy.target_audience ?? "").toLowerCase().includes(normalized),
    );
  }, [strategies, query]);

  // Zero estratégia cadastrada é um caso diferente de "a busca não achou nada" — o primeiro
  // precisa de uma ação clara (criar a primeira), o segundo só precisa dizer que não achou.
  if (strategies.length === 0) {
    return (
      <>
        <EmptyState
          icon={Target}
          title="Nenhuma estratégia ainda"
          description="Estratégias organizam de onde seus leads vêm e quanto cada campanha converte. Crie a primeira pra começar a ver o funil."
          action={
            <Button type="button" onClick={() => setCreating(true)} className="gap-2">
              <Plus className="size-4" />
              Nova estratégia
            </Button>
          }
        />
        <StrategyFormDialog open={creating} onOpenChange={setCreating} />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar estratégia..." className="pl-9" />
        </div>
        <Button type="button" onClick={() => setCreating(true)} className="ml-auto gap-2">
          <Plus className="size-4" />
          Nova estratégia
        </Button>
      </div>

      {visible.length === 0 ? (
        <EmptyInline icon={Search} label="Nenhuma estratégia encontrada pra essa busca." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {visible.map((strategy) => {
            const cardContent = (
              <>
                <h3 className="text-base font-medium">{strategy.name}</h3>
                {strategy.target_audience && <p className="text-sm text-muted-foreground">{strategy.target_audience}</p>}
                <div className="mt-2 flex flex-wrap gap-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                  {strategy.prospecting_goal != null && <span>Meta prospecção: {strategy.prospecting_goal}</span>}
                  {strategy.meetings_goal != null && <span>Meta reuniões: {strategy.meetings_goal}</span>}
                  {strategy.closing_goal != null && <span>Meta fechamento: {strategy.closing_goal}</span>}
                </div>
              </>
            );
            const cardClassName = "flex flex-col gap-2 rounded-xl border border-border/60 bg-card/40 p-5 text-left transition-colors hover:border-border hover:bg-card/70";
            return onSelectStrategy ? (
              <button key={strategy.id} type="button" onClick={() => onSelectStrategy(strategy.id)} className={cardClassName}>
                {cardContent}
              </button>
            ) : (
              <Link key={strategy.id} href={`/comercial/estrategias/${strategy.id}`} className={cardClassName}>
                {cardContent}
              </Link>
            );
          })}
        </div>
      )}

      <StrategyFormDialog open={creating} onOpenChange={setCreating} />
    </div>
  );
}
