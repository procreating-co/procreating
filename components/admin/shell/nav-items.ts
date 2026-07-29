import {
  BarChart3,
  FolderKanban,
  LayoutDashboard,
  LayoutTemplate,
  Settings,
  UploadCloud,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

/**
 * Sidebar definitiva — todos os 8 itens já têm rota real (mesmo que a página seja um
 * placeholder "Em construção" por enquanto: Uploads, Analytics, Configurações, Usuários).
 */
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Clientes", href: "/admin/clientes", icon: Users },
  { label: "Projetos", href: "/admin/projetos", icon: FolderKanban },
  { label: "Uploads", href: "/admin/uploads", icon: UploadCloud },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Templates", href: "/admin/templates", icon: LayoutTemplate },
  { label: "Configurações", href: "/admin/configuracoes", icon: Settings },
  { label: "Usuários", href: "/admin/usuarios", icon: UserCog },
];
