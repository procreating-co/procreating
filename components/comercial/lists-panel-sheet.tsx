"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { ProspeccaoView } from "@/components/comercial/prospeccao-view";
import type { ProspectingList, Strategy } from "@/lib/supabase/types/database";

/**
 * §2/§4/§20 — "Listas" deixa de ser aba própria (era `?tab=prospeccao`, página inteira) e vira um
 * `Sheet` dentro da aba única "Commercial" — conteúdo idêntico (`ProspeccaoView`, não tocado por
 * dentro), só o container muda. Abre sozinho quando chega via `?panel=lists` (alias de
 * `?tab=prospeccao`, resolvido em `page.tsx`) — mesmo padrão de `?import=1` que `ProspeccaoView`
 * já usa: lê o parâmetro, abre, remove da URL (senão um refresh reabriria sozinho).
 *
 * `sm:max-w-xl` (não o `sm:max-w-md` padrão de `LeadDetailDrawer`) — o grid de cards de
 * `ProspeccaoView` é 2 colunas a partir de `lg`; um drawer estreito demais forçaria 1 coluna
 * sempre, perdendo densidade sem necessidade.
 */
export function ListsPanelSheet({ lists, strategies }: { lists: ProspectingList[]; strategies: Strategy[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("panel") !== "lists") return;
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
        <ListChecks className="size-3.5" />
        Listas
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full gap-0 overflow-y-auto bg-popover p-6 text-popover-foreground sm:max-w-xl">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <SheetTitle>Listas de prospecção</SheetTitle>
              <SheetDescription>Motor de listas — importe um CSV, o sistema deduplica e organiza em listas conectadas às estratégias.</SheetDescription>
            </div>
            <ProspeccaoView lists={lists} strategies={strategies} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
