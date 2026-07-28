"use client";

import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOutAction } from "@/app/admin/(protected)/actions";
import { useAdminUser } from "@/lib/admin/auth/auth-context";
import { ADMIN_NAV_ITEMS } from "@/components/admin/shell/nav-items";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();
  const user = useAdminUser();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-border/60 bg-card/40 lg:flex">
      <div className="flex h-16 items-center px-6">
        <span className="font-display text-lg tracking-tight">Procreating</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </a>
          );
        })}
      </nav>

      <div className="border-t border-border/60 p-3">
        <div className="flex items-center gap-3 rounded-md px-3 py-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground/10 font-mono text-xs uppercase">
            {user.name.slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            <LogOut className="size-4" />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
