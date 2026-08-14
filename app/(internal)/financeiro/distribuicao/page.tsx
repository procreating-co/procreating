import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { computeFinanceiroMetrics } from "@/lib/financeiro/queries";
import { computeDistribution } from "@/lib/financeiro/rules";

export const metadata: Metadata = {
  title: "Distribuição — Procreating",
  robots: { index: false, follow: false },
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default async function DistribuicaoPage() {
  const metrics = await computeFinanceiroMetrics();
  const distribution = await computeDistribution(metrics.revenueThisMonth);

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 pt-8 pb-16 lg:px-10">
      <Link href="/financeiro" className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-3.5" />
        Financeiro
      </Link>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl">Distribuição</h1>
        <p className="max-w-lg text-sm text-muted-foreground">
          Faturamento deste mês → operacional → distribuível → por sócio, calculado a partir da regra em{" "}
          <Link href="/configuracoes/regras-financeiras" className="underline underline-offset-4 hover:text-foreground">
            Regras financeiras
          </Link>
          .
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-card/40 p-6">
        <div className="flex flex-col gap-0.5">
          <p className="text-xs text-muted-foreground">Faturamento (mês)</p>
          <p className="text-2xl font-semibold tabular-nums">{currencyFormatter.format(distribution.revenue)}</p>
        </div>
        <ArrowRight className="size-4 text-muted-foreground" />
        <div className="flex flex-col gap-0.5">
          <p className="text-xs text-muted-foreground">Operacional ({distribution.operationalPercentage}%)</p>
          <p className="text-2xl font-semibold tabular-nums">{currencyFormatter.format(distribution.operationalAmount)}</p>
        </div>
        <ArrowRight className="size-4 text-muted-foreground" />
        <div className="flex flex-col gap-0.5">
          <p className="text-xs text-muted-foreground">Distribuível</p>
          <p className="text-2xl font-semibold tabular-nums text-brand">{currencyFormatter.format(distribution.distributable)}</p>
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Por sócio</h2>
        {distribution.partners.length === 0 ? (
          <div className="rounded-xl border border-border/60 bg-card/20 px-6 py-16 text-center text-muted-foreground">Nenhum sócio (`role: owner`) cadastrado ainda.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {distribution.partners.map((partner) => (
              <div key={partner.userId} className="flex flex-col gap-1 rounded-xl border border-border/60 bg-card/40 p-5">
                <p className="text-sm font-medium">{partner.name}</p>
                <p className="text-2xl font-semibold tabular-nums">{currencyFormatter.format(partner.amount)}</p>
                <p className="text-xs text-muted-foreground">{partner.percentage.toFixed(1)}% do distribuível</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
