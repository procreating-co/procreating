import { Building2, Layers, type LucideIcon } from "lucide-react";
import type { Role } from "@/lib/dashboard/roles";

export type DashboardChildItem = {
  label: string;
  status: "soon";
};

export type DashboardSection = {
  key: string;
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  /** Não aplicado ainda (sem autenticação); reservado para quando o acesso por papel existir. */
  roles?: Role[];
  /**
   * Itens futuros do grupo. Não renderizados como navegação hoje — só documentam pra onde
   * cada grupo cresce, pra a sidebar poder virar expansível sem redesenhar o modelo de dados.
   */
  children: DashboardChildItem[];
};

export const DASHBOARD_SECTIONS: DashboardSection[] = [
  {
    key: "operacao",
    label: "Operação",
    description: "Tudo relacionado aos clientes, projetos, produção e equipe.",
    href: "/operacao",
    icon: Layers,
    children: [
      { label: "Clientes", status: "soon" },
      { label: "Projetos", status: "soon" },
      { label: "Produção", status: "soon" },
      { label: "Equipe", status: "soon" },
      { label: "Funcionários", status: "soon" },
      { label: "CRM", status: "soon" },
      { label: "Conteúdos", status: "soon" },
      { label: "Mídias", status: "soon" },
      { label: "Calendário", status: "soon" },
      { label: "Entrega", status: "soon" },
    ],
  },
  {
    key: "administracao",
    label: "Administração",
    description: "Gestão da empresa, crescimento, financeiro e planejamento.",
    href: "/administracao",
    icon: Building2,
    children: [
      { label: "Financeiro", status: "soon" },
      { label: "Indicadores", status: "soon" },
      { label: "Marketing", status: "soon" },
      { label: "Comercial", status: "soon" },
      { label: "Metas", status: "soon" },
      { label: "Planejamento", status: "soon" },
      { label: "Documentos", status: "soon" },
      { label: "RH", status: "soon" },
      { label: "Configurações", status: "soon" },
    ],
  },
];
