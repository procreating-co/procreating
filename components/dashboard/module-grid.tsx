import type { DashboardSection } from "@/components/dashboard/nav-config";
import { ModuleCard } from "@/components/dashboard/module-card";

export function ModuleGrid({ section }: { section: DashboardSection }) {
  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-10 px-6 py-16 lg:px-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl">{section.label}</h1>
        <p className="max-w-lg text-sm text-muted-foreground">{section.description}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {section.modules.map((module, index) => {
          const Icon = module.icon;
          return (
            <ModuleCard
              key={module.key}
              label={module.label}
              description={module.description}
              icon={<Icon className="size-4.5" />}
              delay={index * 0.05}
              href={module.href}
            />
          );
        })}
      </div>
    </main>
  );
}
