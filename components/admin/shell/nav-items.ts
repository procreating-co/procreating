import { FolderKanban, LayoutDashboard, type LucideIcon } from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

/**
 * Só itens com rota real entram aqui. Cada etapa nova do admin adiciona uma linha — a
 * sidebar em si não muda.
 */
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Projetos", href: "/admin/projetos", icon: FolderKanban },
];
