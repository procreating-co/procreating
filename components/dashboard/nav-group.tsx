"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import type { NavGroup as NavGroupData } from "@/components/dashboard/nav-config";
import { cn } from "@/lib/utils";

/**
 * Grupo colapsável da sidebar (Fase 1, Foundation) — um item de `NAV_GROUPS`
 * (`components/dashboard/nav-config.ts`). Aberto por padrão quando a rota atual está dentro do
 * grupo; senão fechado. Puramente estrutural — não introduz cor/tipografia nova, só reorganiza
 * os mesmos links que já existiam soltos.
 */
export function NavGroup({ group }: { group: NavGroupData }) {
  const pathname = usePathname();
  const isActiveGroup = group.items.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  const [open, setOpen] = useState(isActiveGroup);
  const Icon = group.icon;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
          isActiveGroup ? "text-foreground" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
        )}
      >
        <Icon className="size-4 shrink-0" />
        <span className="flex-1 text-left">{group.label}</span>
        <ChevronDown className={cn("size-3.5 shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="mt-0.5 flex flex-col gap-0.5 pl-10">
          {group.items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  active ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
