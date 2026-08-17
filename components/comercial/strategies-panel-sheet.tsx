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
 * O detalhe de UMA estratégia (clicar num card aqui) continua navegando pra
 * `/comercial/estrategias/[id]`, a página que já existe — a conversão DESSA rota pra drawer é o
 * próximo passo (maior risco da lista, parado de propósito pra teste manual antes de fechar), não
 * parte desta mudança.
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
            <StrategiesList strategies={strategies} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
