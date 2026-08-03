import {
  BarChart3,
  Building2,
  Contact2,
  Factory,
  FileText,
  FolderKanban,
  Handshake,
  Layers,
  Megaphone,
  PackageCheck,
  Settings,
  UserCog,
  Users,
  UsersRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/dashboard/roles";

export type ModuleItem = {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
  status: "soon" | "available";
  /** Só presente quando o módulo já existe em outro sistema (ex.: `/clients`, a Client Platform). */
  href?: string;
  /** Agrupamento visual dentro da página do grupo. Sem `category`, o módulo cai numa grade única. */
  category?: string;
};

export type DashboardSection = {
  key: string;
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  /** Não aplicado ainda (sem autenticação); reservado para quando o acesso por papel existir. */
  roles?: Role[];
  /** Módulos do grupo, renderizados como cards em `/operacao` e `/administracao`. */
  modules: ModuleItem[];
};

export const DASHBOARD_SECTIONS: DashboardSection[] = [
  {
    key: "operacao",
    label: "Operação",
    description: "Tudo relacionado aos clientes, projetos, produção e equipe.",
    href: "/operacao",
    icon: Layers,
    modules: [
      {
        key: "clientes",
        label: "Clientes",
        description: "Gerencie workspaces, entregas e informações dos clientes.",
        icon: Users,
        status: "available",
        href: "/clients",
        category: "Clientes & Relacionamento",
      },
      { key: "crm", label: "CRM", description: "Relacionamento e funil comercial com clientes.", icon: Contact2, status: "soon", category: "Clientes & Relacionamento" },
      { key: "projetos", label: "Projetos", description: "Acompanhamento dos projetos em andamento.", icon: FolderKanban, status: "soon", category: "Execução" },
      { key: "producao", label: "Produção", description: "Fluxo de execução e produção das entregas.", icon: Factory, status: "soon", category: "Execução" },
      { key: "entregas", label: "Entregas", description: "Status e histórico de entregas realizadas.", icon: PackageCheck, status: "soon", category: "Execução" },
      { key: "equipe", label: "Equipe", description: "Pessoas, funções e alocação de trabalho.", icon: UsersRound, status: "soon", category: "Pessoas & Conteúdo" },
      { key: "conteudo", label: "Conteúdo", description: "Criação e organização de conteúdo.", icon: FileText, status: "soon", category: "Pessoas & Conteúdo" },
    ],
  },
  {
    key: "administracao",
    label: "Administração",
    description: "Gestão da empresa, crescimento, financeiro e planejamento.",
    href: "/administracao",
    icon: Building2,
    modules: [
      { key: "financeiro", label: "Financeiro", description: "Receitas, despesas e fluxo de caixa.", icon: Wallet, status: "soon" },
      { key: "comercial", label: "Comercial", description: "Pipeline comercial e propostas.", icon: Handshake, status: "soon" },
      { key: "marketing", label: "Marketing", description: "Campanhas, posicionamento e crescimento.", icon: Megaphone, status: "soon" },
      { key: "indicadores", label: "Indicadores", description: "Métricas e desempenho da empresa.", icon: BarChart3, status: "soon" },
      { key: "rh", label: "RH", description: "Gestão de pessoas e processos internos.", icon: UserCog, status: "soon" },
      { key: "configuracoes", label: "Configurações", description: "Preferências e configurações da plataforma.", icon: Settings, status: "soon" },
    ],
  },
];
