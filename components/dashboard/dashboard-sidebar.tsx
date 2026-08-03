"use client";

import { usePathname } from "next/navigation";
import { DASHBOARD_SECTIONS } from "@/components/dashboard/nav-config";
import { NavigationItem } from "@/components/dashboard/navigation-item";

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-border/60 bg-card/40 lg:flex">
      <div className="flex h-16 items-center px-6">
        <span className="font-display text-lg tracking-tight">Procreating</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {DASHBOARD_SECTIONS.map((section) => {
          const active = pathname === section.href || pathname.startsWith(`${section.href}/`);
          return (
            <NavigationItem
              key={section.key}
              href={section.href}
              label={section.label}
              icon={section.icon}
              active={active}
            />
          );
        })}
      </nav>
    </aside>
  );
}
