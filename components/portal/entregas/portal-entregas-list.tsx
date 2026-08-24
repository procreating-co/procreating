import { StatusDot } from "@/components/dashboard/status-dot";
import { PRODUCTION_ITEM_KIND_LABEL } from "@/lib/operacao/types";
import type { PortalProductionItemsByKind } from "@/lib/portal/queries";
import type { ProductionItemKind } from "@/lib/supabase/types/database";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

const KIND_ORDER: ProductionItemKind[] = ["producao", "conteudo", "entrega"];

/** Uma seção por `kind` que tiver pelo menos 1 item — nunca mostra uma seção vazia (menos ruído
 *  visual que 3 abas sempre presentes, mesmo padrão de decisão do resto do Portal). */
export function PortalEntregasList({ itemsByKind }: { itemsByKind: PortalProductionItemsByKind }) {
  const hasAnyItem = KIND_ORDER.some((kind) => itemsByKind[kind].length > 0);

  if (!hasAnyItem) {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card/40 p-6">
        <p className="text-lg">Nenhuma entrega cadastrada ainda.</p>
        <p className="text-sm text-muted-foreground">
          Assim que sua agência começar a produzir, cada item aparece aqui com o status atualizado em tempo real.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {KIND_ORDER.filter((kind) => itemsByKind[kind].length > 0).map((kind) => (
        <section key={kind} className="flex flex-col gap-3">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{PRODUCTION_ITEM_KIND_LABEL[kind]}</h2>
          <ul className="flex flex-col gap-2">
            {itemsByKind[kind].map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-card/40 p-4">
                <div className="flex flex-col gap-0.5">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">Atualizado em {dateFormatter.format(new Date(item.updated_at))}</p>
                </div>
                <StatusDot tone={item.status_tone} label={item.status_label} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
