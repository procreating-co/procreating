import type { Metadata } from "next";
import { MetricCard } from "@/components/admin/dashboard/metric-card";
import { METRIC_ICONS } from "@/components/admin/dashboard/metric-icons";
import { ProjectsTable } from "@/components/admin/dashboard/projects-table";
import { mockDashboardMetrics } from "@/lib/admin/dashboard/mock-metrics";
import { mockProjects } from "@/lib/admin/projects/mock-data";

export const metadata: Metadata = { title: "Dashboard | Painel Procreating" };

export default function AdminDashboardPage() {
  return (
    <main className="mx-auto max-w-[1400px] px-6 py-10 lg:px-10">
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">Visão geral</p>
        <h1 className="mt-1 font-display text-3xl">Dashboard</h1>
      </header>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mockDashboardMetrics.map((metric) => (
          <MetricCard key={metric.key} icon={METRIC_ICONS[metric.key]} label={metric.label} value={metric.value} hint={metric.hint} />
        ))}
      </section>

      <section className="mt-10">
        <h2 className="mb-4 font-display text-xl">Projetos</h2>
        <ProjectsTable projects={mockProjects} />
      </section>
    </main>
  );
}
