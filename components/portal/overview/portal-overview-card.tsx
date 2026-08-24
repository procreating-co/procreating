import type { Contract } from "@/lib/supabase/types/database";

const CONTRACT_TYPE_LABEL: Record<Contract["type"], string> = {
  recorrente: "Contrato recorrente",
  pontual: "Projeto pontual",
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" });

/** Overview — deliberadamente poucos números, cada um com contexto ao lado (nunca um card cru
 *  "12"). Nenhum valor em R$ (financeiro é fase futura, fora do escopo do piloto). */
export function PortalOverviewCard({
  clientName,
  contract,
  totalItems,
  concludedItems,
}: {
  clientName: string;
  contract: Contract | null;
  totalItems: number;
  concludedItems: number;
}) {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card/40 p-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Sua agência está trabalhando</p>
        <p className="text-lg">
          {contract
            ? `${CONTRACT_TYPE_LABEL[contract.type]} desde ${dateFormatter.format(new Date(contract.start_date))}.`
            : `Nenhum contrato ativo encontrado para ${clientName} no momento.`}
        </p>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1 rounded-xl border border-border/60 bg-card/40 p-6">
          <p className="text-3xl font-display">{totalItems}</p>
          <p className="text-sm text-muted-foreground">{totalItems === 1 ? "item em produção" : "itens em produção"}</p>
        </div>
        <div className="flex flex-col gap-1 rounded-xl border border-border/60 bg-card/40 p-6">
          <p className="text-3xl font-display">{concludedItems}</p>
          <p className="text-sm text-muted-foreground">{concludedItems === 1 ? "entrega concluída" : "entregas concluídas"}</p>
        </div>
      </section>

      {totalItems === 0 && (
        <p className="text-sm text-muted-foreground">
          Ainda não há itens de produção cadastrados. Assim que sua agência começar a trabalhar, eles aparecem aqui e na aba Entregas.
        </p>
      )}
    </div>
  );
}
