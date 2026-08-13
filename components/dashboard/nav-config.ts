import {
  BarChart3,
  Building2,
  Factory,
  FileText,
  FolderKanban,
  Handshake,
  Layers,
  Megaphone,
  PackageCheck,
  Settings,
  TrendingUp,
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
  /** Texto do botão de ação — só faz sentido junto de `href` (ex.: "Abrir Client Hub"). */
  actionLabel?: string;
  /** Última atividade mockada do módulo. `demo: true` marca explicitamente que não é dado real. */
  lastAction?: { label: string; demo?: boolean };
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
        description: "Workspace, entregas e relacionamento com clientes.",
        icon: Users,
        status: "available",
        href: "/clients",
        category: "Clientes & Relacionamento",
        actionLabel: "Abrir Client Hub",
        lastAction: { label: "Workspace do Pascoal atualizado há 2h", demo: true },
      },
      {
        key: "projetos",
        label: "Projetos",
        description: "Acompanhamento dos projetos em andamento.",
        icon: FolderKanban,
        status: "available",
        href: "/operacao/projetos",
        category: "Execução",
        actionLabel: "Abrir Projetos",
        lastAction: { label: "Pascoal Bombas avançou para Em produção", demo: true },
      },
      {
        key: "producao",
        label: "Produção",
        description: "Fluxo de execução e produção das entregas.",
        icon: Factory,
        status: "available",
        href: "/operacao/producao",
        category: "Execução",
        actionLabel: "Abrir Produção",
        lastAction: { label: "Vídeo institucional Pascoal entrou em edição", demo: true },
      },
      {
        key: "entregas",
        label: "Entregas",
        description: "Status e histórico de entregas realizadas.",
        icon: PackageCheck,
        status: "available",
        href: "/operacao/entregas",
        category: "Execução",
        actionLabel: "Abrir Entregas",
        lastAction: { label: "Landing Page Pascoal enviada para aprovação", demo: true },
      },
      {
        key: "equipe",
        label: "Equipe",
        description: "Pessoas, funções e alocação de trabalho.",
        icon: UsersRound,
        status: "available",
        href: "/operacao/equipe",
        category: "Pessoas & Conteúdo",
        actionLabel: "Abrir Equipe",
        lastAction: { label: "Cristiano assumiu o Vídeo institucional Pascoal", demo: true },
      },
      {
        key: "conteudo",
        label: "Conteúdo",
        description: "Criação e organização de conteúdo.",
        icon: FileText,
        status: "available",
        href: "/operacao/conteudo",
        category: "Pessoas & Conteúdo",
        actionLabel: "Abrir Conteúdo",
        lastAction: { label: "Reels institucional Pascoal entrou em produção", demo: true },
      },
    ],
  },
  {
    key: "administracao",
    label: "Administração",
    description: "Gestão da empresa, crescimento e planejamento.",
    href: "/administracao",
    icon: Building2,
    modules: [
      // "financeiro" e "comercial" saíram daqui na Fase 2-5 — viraram produtos reais em
      // /financeiro e /comercial, não fazem mais sentido como card "em breve".
      { key: "marketing", label: "Marketing", description: "Campanhas, posicionamento e crescimento.", icon: Megaphone, status: "soon", category: "Marketing & Indicadores" },
      { key: "indicadores", label: "Indicadores", description: "Métricas e desempenho da empresa.", icon: BarChart3, status: "soon", category: "Marketing & Indicadores" },
      { key: "rh", label: "RH", description: "Gestão de pessoas e processos internos.", icon: UserCog, status: "soon", category: "Pessoas & Configurações" },
      { key: "configuracoes", label: "Configurações", description: "Preferências e configurações da plataforma.", icon: Settings, status: "soon", category: "Pessoas & Configurações" },
    ],
  },
];

export type NavGroupItem = {
  key: string;
  label: string;
  href: string;
};

export type NavGroup = {
  key: string;
  label: string;
  icon: LucideIcon;
  items: NavGroupItem[];
};

/**
 * Navegação em grupos colapsáveis da sidebar. Estrutura final da Fase 2-5 (Comercial/Onboarding/
 * Financeiro) — Comercial e Financeiro agora são produtos reais (`/comercial/**`,
 * `/financeiro/**`), não mais placeholders "em breve" apontando pra `/administracao` (Fase 1).
 * "Clientes conquistados" (dentro de Comercial) leva pra `/clientes` — a visão 360º interna,
 * deliberadamente um segmento diferente de `/clients` (Client Hub público, domínio de entrega ao
 * cliente, intocado). "Relatórios" e "Configurações" continuam placeholder, apontando pro mesmo
 * card "em breve" de sempre (`/administracao`) — nenhuma página nova só pra preencher o menu.
 *
 * "Operação" mantém Equipe/Conteúdo além de Projetos/Produção/Entregas — já existem, já
 * funcionam, não faz sentido tirar do menu só porque a árvore pedida não os citou.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    key: "comercial",
    label: "Comercial",
    icon: Handshake,
    items: [
      { key: "estrategias", label: "Estratégias", href: "/comercial/estrategias" },
      { key: "leads", label: "Leads", href: "/comercial/leads" },
      { key: "pipeline", label: "Pipeline", href: "/comercial/pipeline" },
      { key: "clientes-conquistados", label: "Clientes conquistados", href: "/clientes" },
      { key: "metricas-comerciais", label: "Métricas comerciais", href: "/comercial" },
    ],
  },
  {
    key: "operacao-grupo",
    label: "Operação",
    icon: Layers,
    items: [
      { key: "projetos", label: "Projetos", href: "/operacao/projetos" },
      { key: "producao", label: "Produção", href: "/operacao/producao" },
      { key: "entregas", label: "Entregas", href: "/operacao/entregas" },
      { key: "equipe", label: "Equipe", href: "/operacao/equipe" },
      { key: "conteudo", label: "Conteúdo", href: "/operacao/conteudo" },
    ],
  },
  {
    key: "financeiro-grupo",
    label: "Financeiro",
    icon: Wallet,
    items: [
      { key: "financeiro-overview", label: "Overview", href: "/financeiro" },
      { key: "receitas", label: "Receitas", href: "/financeiro/receitas" },
      { key: "despesas", label: "Despesas", href: "/financeiro/despesas" },
      { key: "contas-a-receber", label: "Contas a receber", href: "/financeiro/contas-a-receber" },
      { key: "contas-a-pagar", label: "Contas a pagar", href: "/financeiro/contas-a-pagar" },
    ],
  },
  {
    key: "relatorios",
    label: "Relatórios",
    icon: TrendingUp,
    items: [{ key: "relatorios-em-breve", label: "Em desenvolvimento", href: "/administracao" }],
  },
  {
    key: "configuracoes",
    label: "Configurações",
    icon: Settings,
    items: [{ key: "empresa", label: "Empresa", href: "/administracao" }],
  },
];
