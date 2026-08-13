"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StrategyFormDialog } from "@/components/comercial/strategy-form-dialog";
import type { Strategy } from "@/lib/comercial/types";

export function StrategyDetailHeader({ strategy }: { strategy: Strategy }) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <Link href="/comercial/estrategias" className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-3.5" />
        Estratégias
      </Link>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl">{strategy.name}</h1>
          {strategy.target_audience && <p className="text-sm text-muted-foreground">{strategy.target_audience}</p>}
        </div>
        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => setEditing(true)}>
          <Pencil className="size-3.5" />
          Editar
        </Button>
      </div>
      <StrategyFormDialog open={editing} onOpenChange={setEditing} strategy={strategy} />
    </div>
  );
}
