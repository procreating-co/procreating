"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StrategyFormDialog } from "@/components/comercial/strategy-form-dialog";
import type { Strategy } from "@/lib/comercial/types";

export function StrategiesList({ strategies }: { strategies: Strategy[] }) {
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return strategies;
    return strategies.filter(
      (strategy) => strategy.name.toLowerCase().includes(normalized) || (strategy.target_audience ?? "").toLowerCase().includes(normalized),
    );
  }, [strategies, query]);

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
        <div className="rounded-xl border border-border/60 bg-card/20 px-6 py-16 text-center text-muted-foreground">
          {strategies.length === 0 ? "Nenhuma estratégia cadastrada ainda." : "Nenhuma estratégia encontrada."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {visible.map((strategy) => (
            <Link
              key={strategy.id}
              href={`/comercial/estrategias/${strategy.id}`}
              className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card/40 p-5 transition-colors hover:border-border hover:bg-card/70"
            >
              <h3 className="text-base font-medium">{strategy.name}</h3>
              {strategy.target_audience && <p className="text-sm text-muted-foreground">{strategy.target_audience}</p>}
              <div className="mt-2 flex flex-wrap gap-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                {strategy.prospecting_goal != null && <span>Meta prospecção: {strategy.prospecting_goal}</span>}
                {strategy.meetings_goal != null && <span>Meta reuniões: {strategy.meetings_goal}</span>}
                {strategy.closing_goal != null && <span>Meta fechamento: {strategy.closing_goal}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}

      <StrategyFormDialog open={creating} onOpenChange={setCreating} />
    </div>
  );
}
