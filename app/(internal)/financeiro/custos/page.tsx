import type { Metadata } from "next";
import { listCosts } from "@/lib/financeiro/queries";
import { CostsList } from "@/components/financeiro/costs-list";

export const metadata: Metadata = {
  title: "Custos — Procreating",
  robots: { index: false, follow: false },
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default async function CustosPage() {
  const costs = await listCosts();
  const monthlyTotal = costs.reduce((sum, cost) => sum + Number(cost.amount), 0);

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 pt-8 pb-16 lg:px-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl">Custos</h1>
        <p className="max-w-lg text-sm text-muted-foreground">
          Estrutura de custo fixo e variável da empresa — aluguel, ferramentas, pró-labore. Ainda não gera lançamento automático em Despesas.
        </p>
        {costs.length > 0 && (
          <p className="mt-2 text-sm">
            <span className="text-muted-foreground">Run-rate mensal: </span>
            <span className="font-medium tabular-nums">{currencyFormatter.format(monthlyTotal)}</span>
          </p>
        )}
      </div>

      <CostsList costs={costs} />
    </main>
  );
}
