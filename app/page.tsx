import { FileText, FolderKanban, PackageCheck, Users } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { GreetingHeader } from "@/components/dashboard/greeting-header";
import { StatTile } from "@/components/dashboard/stat-tile";
import { SectionCard } from "@/components/dashboard/section-card";
import { DASHBOARD_SECTIONS } from "@/components/dashboard/nav-config";

/**
 * Resumo geral mockado — não há backend ainda, por isso cada tile carrega a etiqueta "Demo"
 * (ver `StatTile`). Números só ilustram o layout, não representam a operação real.
 */
const STAT_TILES = [
  { key: "clientes-ativos", label: "Clientes ativos", value: "12", icon: Users },
  { key: "projetos-andamento", label: "Projetos em andamento", value: "5", icon: FolderKanban },
  { key: "conteudos-pendentes", label: "Conteúdos pendentes", value: "8", icon: FileText },
  { key: "entregas-semana", label: "Entregas da semana", value: "3", icon: PackageCheck },
];

/**
 * Home da plataforma interna — dashboard principal, não mais landing page. Independente de
 * `/clients/<slug>` (entregas de cliente) e de `/admin` (painel legado); ver
 * `components/dashboard/` para o chrome e `nav-config.ts` pra onde cada seção leva.
 */
export default function Home() {
  return (
    <DashboardLayout>
      <main className="mx-auto flex max-w-[1400px] flex-col gap-10 px-6 py-16 lg:px-10">
        <GreetingHeader />

        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Resumo geral</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {STAT_TILES.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <StatTile
                  key={stat.key}
                  label={stat.label}
                  value={stat.value}
                  icon={<Icon className="size-4.5" />}
                  delay={index * 0.05}
                />
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Acesso rápido</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {DASHBOARD_SECTIONS.map((section, index) => {
              const Icon = section.icon;
              return (
                <SectionCard
                  key={section.key}
                  href={section.href}
                  label={section.label}
                  description={section.description}
                  icon={<Icon className="size-5" />}
                  delay={index * 0.08}
                />
              );
            })}
          </div>
        </section>
      </main>
    </DashboardLayout>
  );
}
