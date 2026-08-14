import {
  BarChart3,
  Building2,
  CalendarCheck,
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
      // /financeiro e /comercial. "marketing" e "configuracoes" saíram nesta fase pelo mesmo
      // motivo — viraram grupos reais na sidebar (/marketing, /configuracoes/**), não fazem mais
      // sentido duplicados aqui como card "em breve" sem link nenhum.
      { key: "indicadores", label: "Indicadores", description: "Métricas e desempenho da empresa.", icon: BarChart3, status: "soon", category: "Indicadores & Pessoas" },
      { key: "rh", label: "RH", description: "Gestão de pessoas e processos internos.", icon: UserCog, status: "soon", category: "Indicadores & Pessoas" },
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
 * Navegação em grupos colapsáveis da sidebar. Reescrita completa nesta fase (esqueleto de
 * navegação + Simulation Engine + Financeiro) pra bater com a árvore final pedida: Comercial,
 * Marketing, Clientes, Financeiro, Operação, Meu Espaço, Configurações — nessa ordem. Antes,
 * "Clientes conquistados" vivia dentro de Comercial e não existiam "Marketing" nem "Meu Espaço";
 * "Relatórios" era um grupo placeholder solto sem lugar na árvore nova — removido (nunca teve
 * conteúdo, só apontava de volta pra `/administracao`).
 *
 * "Clientes" (`/clientes`) é a visão 360º interna, deliberadamente um segmento diferente de
 * `/clients` (Client Hub público, domínio de entrega ao cliente, intocado).
 *
 * "Operação" mantém Equipe/Conteúdo além de Projetos/Produção/Entregas — já existem, já
 * funcionam, não faz sentido tirar do menu só porque a árvore pedida não os citou.
 *
 * Rotas ainda sem conteúdo real (`/marketing`, `/configuracoes/empresa`, `/configuracoes/
 * usuarios`) usam `ComingSoon` na própria página — o link aqui já é o definitivo, não um
 * apontamento provisório pra `/administracao` como antes.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    key: "comercial",
    label: "Comercial",
    icon: Handshake,
    items: [
      { key: "comercial-dashboard", label: "Dashboard", href: "/comercial" },
      { key: "estrategias", label: "Estratégias", href: "/comercial/estrategias" },
      { key: "pipeline", label: "CRM / Pipeline", href: "/comercial/pipeline" },
      { key: "leads", label: "Leads", href: "/comercial/leads" },
    ],
  },
  {
    key: "marketing",
    label: "Marketing",
    icon: Megaphone,
    items: [
      { key: "marketing-dashboard", label: "Dashboard", href: "/marketing" },
      { key: "simuladores", label: "Simuladores", href: "/marketing/simuladores" },
    ],
  },
  {
    key: "clientes",
    label: "Clientes",
    icon: Users,
    items: [
      { key: "clientes-todos", label: "Todos", href: "/clientes" },
      { key: "clientes-onboarding", label: "Onboarding", href: "/clientes/onboarding" },
    ],
  },
  {
    key: "financeiro-grupo",
    label: "Financeiro",
    icon: Wallet,
    items: [
      { key: "financeiro-dashboard", label: "Dashboard", href: "/financeiro" },
      { key: "receitas", label: "Receitas", href: "/financeiro/receitas" },
      { key: "despesas", label: "Despesas", href: "/financeiro/despesas" },
      { key: "custos", label: "Custos", href: "/financeiro/custos" },
      { key: "distribuicao", label: "Distribuição", href: "/financeiro/distribuicao" },
      { key: "contas-a-receber", label: "Contas a receber", href: "/financeiro/contas-a-receber" },
      { key: "contas-a-pagar", label: "Contas a pagar", href: "/financeiro/contas-a-pagar" },
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
    key: "meu-espaco",
    label: "Meu Espaço",
    icon: CalendarCheck,
    items: [{ key: "meu-dia", label: "Meu Dia", href: "/meu-dia" }],
  },
  {
    key: "configuracoes",
    label: "Configurações",
    icon: Settings,
    items: [
      { key: "empresa", label: "Empresa", href: "/configuracoes/empresa" },
      { key: "usuarios", label: "Usuários", href: "/configuracoes/usuarios" },
      { key: "regras-financeiras", label: "Regras financeiras", href: "/configuracoes/regras-financeiras" },
    ],
  },
];
