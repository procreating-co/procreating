import type { Metadata } from "next";
import { Wallet } from "lucide-react";
import { computeDistribution, getFinancialRule } from "@/lib/financeiro/rules";

export const metadata: Metadata = {
  title: "Regras financeiras — Procreating",
  robots: { index: false, follow: false },
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/**
 * Só leitura nesta fase — o prompt liberou não construir UI de edição ainda se isso atrasasse o
 * essencial (Simulador/Financeiro). A regra existe e é lida de verdade (`lib/financeiro/rules.ts`,
 * `public.financial_rules`/`partner_shares`); editar aqui é próxima fase.
 */
export default async function RegrasFinanceirasPage() {
  const rule = await getFinancialRule();
  const operationalPercentage = rule?.operational_percentage ?? 20;
  // Simulação com R$ 100 pra mostrar a proporção sem depender de faturamento real do mês.
  const preview = await computeDistribution(100);

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 pt-8 pb-16 lg:px-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl">Regras financeiras</h1>
        <p className="max-w-lg text-sm text-muted-foreground">
          A regra que todo cálculo de distribuição usa (Financeiro → Distribuição, futuramente Home) — edição por aqui chega numa fase seguinte.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card/40 p-6">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-foreground/10 text-foreground">
              <Wallet className="size-4.5" />
            </div>
            <h2 className="text-sm font-medium">Percentual operacional</h2>
          </div>
          <p className="text-3xl font-semibold tabular-nums">{operationalPercentage}%</p>
          <p className="text-sm text-muted-foreground">do faturamento vai pro operacional antes de qualquer distribuição — o resto ({100 - operationalPercentage}%) é distribuível entre os sócios.</p>
        </section>

        <section className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card/40 p-6">
          <h2 className="text-sm font-medium">Divisão entre sócios (proporção)</h2>
          <p className="text-xs text-muted-foreground">Calculada em cima de quem tem `role: owner` hoje — sem override em `partner_shares`, divide igual entre todos.</p>
          {preview.partners.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum sócio (`role: owner`) cadastrado ainda.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {preview.partners.map((partner) => (
                <li key={partner.userId} className="flex items-center justify-between text-sm">
                  <span>{partner.name}</span>
                  <span className="font-medium tabular-nums">{partner.percentage.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-6">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Exemplo — R$ 100,00 de faturamento</h2>
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-muted-foreground">Operacional</p>
            <p className="font-medium tabular-nums">{currencyFormatter.format(preview.operationalAmount)}</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-muted-foreground">Distribuível</p>
            <p className="font-medium tabular-nums">{currencyFormatter.format(preview.distributable)}</p>
          </div>
          {preview.partners.map((partner) => (
            <div key={partner.userId} className="flex flex-col gap-0.5">
              <p className="text-xs text-muted-foreground">{partner.name}</p>
              <p className="font-medium tabular-nums">{currencyFormatter.format(partner.amount)}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
