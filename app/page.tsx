import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { SectionCard } from "@/components/dashboard/section-card";
import { DASHBOARD_SECTIONS } from "@/components/dashboard/nav-config";

/**
 * Home da plataforma interna — dashboard principal, não mais landing page. Independente de
 * `/clients/<slug>` (entregas de cliente) e de `/admin` (painel legado); ver
 * `components/dashboard/` para o chrome e `nav-config.ts` pra onde cada seção leva.
 */
export default function Home() {
  return (
    <DashboardLayout>
      <main className="mx-auto flex max-w-[1400px] flex-col gap-12 px-6 py-20 lg:px-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="font-display text-4xl">Bem-vindo</h1>
          <p className="max-w-md text-sm text-muted-foreground">
            Gerencie toda a operação da empresa em um único lugar.
          </p>
        </div>

        <div className="mx-auto grid w-full max-w-3xl gap-6 sm:grid-cols-2">
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
      </main>
    </DashboardLayout>
  );
}
