"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { StrategiesList } from "@/components/comercial/strategies-list";
import type { Strategy } from "@/lib/comercial/types";

/**
 * §2/§4/§20 — "Estratégias" deixa de ser aba própria (era `?tab=estrategias`) e vira um `Sheet`,
 * mesmo raciocínio de `ListsPanelSheet` (conteúdo idêntico, `StrategiesList` não tocado por
 * dentro). Abre sozinho via `?panel=strategies` (alias de `?tab=estrategias`).
 *
 * Clicar num card (passo 5, liberado após teste manual dos passos 1-4) fecha este painel e abre
 * o drawer de detalhe (`StrategyDetailDrawer`, `?strategyDetail=<id>`) — `onSelectStrategy` fecha
 * o próprio Sheet antes de navegar, orquestrado aqui porque é este componente que já é dono do
 * `open`.
 */
export function StrategiesPanelSheet({ strategies }: { strategies: Strategy[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("panel") !== "strategies") return;
    setOpen(true);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("panel");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <Target className="size-3.5" />
        Estratégias
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full gap-0 overflow-y-auto bg-popover p-6 text-popover-foreground sm:max-w-xl">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <SheetTitle>Estratégias</SheetTitle>
              <SheetDescription>Campanhas comerciais — público-alvo, oferta, canal e metas de prospecção.</SheetDescription>
            </div>
            <StrategiesList
              strategies={strategies}
              onSelectStrategy={(strategyId) => {
                setOpen(false);
                const params = new URLSearchParams(searchParams.toString());
                params.set("strategyDetail", strategyId);
                router.push(`${pathname}?${params.toString()}`, { scroll: false });
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
