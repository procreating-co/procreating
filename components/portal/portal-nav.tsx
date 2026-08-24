"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/** Duas abas só nesta fase (B3/B4) — Conteúdos e Resultados entram quando as fases
 *  correspondentes (B5/B6) forem implementadas, não antes (evita link morto). */
export function PortalNav({ slug }: { slug: string }) {
  const pathname = usePathname();
  const items = [
    { href: `/portal/${slug}`, label: "Visão geral" },
    { href: `/portal/${slug}/entregas`, label: "Entregas" },
  ];

  return (
    <nav className="flex gap-1 border-b border-border/60">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "border-b-2 px-3 pb-3 text-sm font-medium transition-colors",
              active ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
