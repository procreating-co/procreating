"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "overview", label: "Overview", href: "" },
  { key: "projetos", label: "Projetos", href: "/projetos" },
  { key: "conteudos", label: "Conteúdos", href: "/conteudos" },
  { key: "fotos", label: "Fotos", href: "/fotos" },
  { key: "videos", label: "Vídeos", href: "/videos" },
  { key: "entregas", label: "Entregas", href: "/entregas" },
  { key: "configuracoes", label: "Configurações", href: "/configuracoes" },
] as const;

/** Navegação interna do Workspace — sub-rotas reais de `/clients/[client]/*`, cada aba abre algo. */
export function WorkspaceNav({ slug }: { slug: string }) {
  const pathname = usePathname();
  const base = `/clients/${slug}`;

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border/60">
      {TABS.map((tab) => {
        const href = `${base}${tab.href}`;
        const isActive = pathname === href;
        return (
          <Link
            key={tab.key}
            href={href}
            className={cn(
              "shrink-0 border-b-2 px-3 py-3 text-sm transition-colors duration-150",
              isActive
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
