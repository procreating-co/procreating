import type { DashboardSection, ModuleItem } from "@/components/dashboard/nav-config";
import { ModuleCard } from "@/components/dashboard/module-card";

/**
 * Agrupa por `category` preservando a ordem de primeira ocorrência. Módulos sem `category`
 * caem todos num grupo único sem rótulo — é o que mantém `/administracao` como uma grade
 * simples até que ela também ganhe categorias.
 */
function groupByCategory(modules: ModuleItem[]) {
  const order: string[] = [];
  const groups = new Map<string, ModuleItem[]>();

  for (const module of modules) {
    const category = module.category ?? "";
    if (!groups.has(category)) {
      groups.set(category, []);
      order.push(category);
    }
    groups.get(category)!.push(module);
  }

  return order.map((category) => ({ category, items: groups.get(category)! }));
}

export function ModuleGrid({ section }: { section: DashboardSection }) {
  const connected = section.modules.filter((module) => module.status === "available").length;
  const groups = groupByCategory(section.modules);

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 py-16 lg:px-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl">{section.label}</h1>
        <p className="max-w-lg text-sm text-muted-foreground">{section.description}</p>
      </div>

      <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2 border-y border-border/60 py-4">
        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-xl">{section.modules.length}</span>
          <span className="text-sm text-muted-foreground">módulos</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-xl text-emerald-300">{connected}</span>
          <span className="text-sm text-muted-foreground">conectado{connected === 1 ? "" : "s"}</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-xl">{section.modules.length - connected}</span>
          <span className="text-sm text-muted-foreground">em breve</span>
        </div>
      </div>

      <div className="flex flex-col gap-10">
        {groups.map(({ category, items }) => (
          <section key={category || "__flat__"} className="flex flex-col gap-4">
            {category && (
              <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{category}</h2>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((module, index) => {
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
          </section>
        ))}
      </div>
    </main>
  );
}
