import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStrategy } from "@/lib/comercial/queries";
import { computeStrategyFunnel } from "@/lib/comercial/funnel";
import { StrategyDetailHeader } from "@/components/comercial/strategy-detail-header";
import { FunnelChart } from "@/components/comercial/funnel-chart";
import { StatTile } from "@/components/dashboard/stat-tile";
import { Target, TrendingUp, Users, Wallet } from "lucide-react";

type Params = { id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const strategy = await getStrategy(id);
  return { title: strategy ? `${strategy.name} — Procreating` : "Estratégia — Procreating", robots: { index: false, follow: false } };
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default async function EstrategiaDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const [strategy, funnel] = await Promise.all([getStrategy(id), computeStrategyFunnel(id)]);
  if (!strategy) notFound();

  const fields: { label: string; value: string | null }[] = [
    { label: "Segmento", value: strategy.segment },
    { label: "Localização", value: strategy.location },
    { label: "Canal de prospecção", value: strategy.prospecting_channel },
    { label: "ICP", value: strategy.icp },
    { label: "Critérios de qualificação", value: strategy.qualification_criteria },
    { label: "Oferta", value: strategy.offer },
    { label: "Argumentos comerciais", value: strategy.sales_pitch },
  ].filter((field) => field.value);

  const conversionRate = funnel.totalLeads > 0 ? funnel.wonLeads / funnel.totalLeads : null;

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 py-16 lg:px-10">
      <StrategyDetailHeader strategy={strategy} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile demo={false} label="Leads" value={String(funnel.totalLeads)} icon={<Users className="size-4.5" />} />
        <StatTile demo={false} label="Fechados" value={String(funnel.wonLeads)} icon={<Target className="size-4.5" />} />
        <StatTile
          demo={false}
          label="Conversão lead → fechado"
          value={conversionRate != null ? `${(conversionRate * 100).toFixed(0)}%` : "—"}
          icon={<TrendingUp className="size-4.5" />}
        />
        <StatTile
          demo={false}
          label="Ticket médio"
          value={funnel.averageTicket != null ? currencyFormatter.format(funnel.averageTicket) : "—"}
          icon={<Wallet className="size-4.5" />}
        />
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Funil</h2>
          <span className="text-xs text-muted-foreground">Receita total contratada: {currencyFormatter.format(funnel.totalRevenue)}</span>
        </div>
        <div className="rounded-xl border border-border/60 bg-card/40 p-5">
          {funnel.totalLeads === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Nenhum lead vinculado a esta estratégia ainda.</p>
          ) : (
            <FunnelChart steps={funnel.steps} />
          )}
        </div>
      </section>

      {fields.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Detalhes</h2>
          <div className="grid grid-cols-1 gap-4 rounded-xl border border-border/60 bg-card/40 p-5 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.label} className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground">{field.label}</p>
                <p className="text-sm">{field.value}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
