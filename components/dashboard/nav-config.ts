import { Layers, LayoutDashboard, Settings, Sun, TrendingUp, Wallet, type LucideIcon } from "lucide-react";

/**
 * Navegação do shell interno (Procreating OS) — reescrita completa nesta fase (sidebar
 * hover-to-expand + top nav contextual). Antes disso existiam 7 grupos colapsáveis na própria
 * sidebar (accordion com submenu) mais um `DASHBOARD_SECTIONS` separado (grade de cards em
 * `/operacao` e `/administracao`) — os dois são substituídos por isto: 6 grupos fixos na
 * sidebar (nunca submenu ali) + uma lista de abas por grupo, renderizada como top nav contextual
 * dentro do `layout.tsx` de cada área (`components/dashboard/top-nav.tsx`).
 *
 * Casca de navegação (rótulos de grupo e de aba) em inglês, por pedido explícito — conteúdo de
 * página continua em português como sempre foi.
 *
 * URLs não foram renomeadas: cada aba aponta pra uma rota que já existe (ou, quando marcado, uma
 * nova) — a reestruturação é de navegação, não uma tradução de rota.
 */
export type NavGroupKey = "workspace" | "dashboard" | "operations" | "growth" | "finance" | "settings";

export type NavGroupDef = {
  key: NavGroupKey;
  label: string;
  icon: LucideIcon;
  /** Rota que o clique no ícone da sidebar abre. */
  href: string;
  /** Prefixos de rota que contam como "este grupo está ativo" — Growth cobre 3 segmentos
   *  distintos (`comercial`, `marketing`, `clientes`) mais `/reports`, os demais só um. */
  matchPrefixes: string[];
};

export const NAV_GROUPS: NavGroupDef[] = [
  { key: "workspace", label: "Workspace", icon: Sun, href: "/meu-dia", matchPrefixes: ["/meu-dia"] },
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/", matchPrefixes: ["/"] },
  { key: "operations", label: "Operations", icon: Layers, href: "/operacao", matchPrefixes: ["/operacao"] },
  { key: "growth", label: "Growth", icon: TrendingUp, href: "/comercial", matchPrefixes: ["/comercial", "/marketing", "/clientes", "/reports"] },
  { key: "finance", label: "Finance", icon: Wallet, href: "/financeiro", matchPrefixes: ["/financeiro"] },
  { key: "settings", label: "Settings", icon: Settings, href: "/configuracoes", matchPrefixes: ["/configuracoes"] },
];

export type TopNavTab = { label: string; href: string };

/** My Day é o conteúdo real de sempre; Tasks é nova (todas as tarefas do usuário, não só as de
 *  hoje); Calendar/Inbox ainda não têm entidade nenhuma por trás — `ComingSoon`. */
export const WORKSPACE_TABS: TopNavTab[] = [
  { label: "My Day", href: "/meu-dia" },
  { label: "Tasks", href: "/meu-dia/tarefas" },
  { label: "Calendar", href: "/meu-dia/calendario" },
  { label: "Inbox", href: "/meu-dia/inbox" },
];

/** Overview (métricas comerciais reais, já existia em `/comercial`) e Clients (visão 360º,
 *  `/clientes`) foram acrescentadas além da lista literal do pedido (CRM/Pipeline/Strategies/
 *  Simulators/Reports) — sem elas, conteúdo real perderia navegação. Reports não existe ainda:
 *  `ComingSoon`. */
export const GROWTH_TABS: TopNavTab[] = [
  { label: "Overview", href: "/comercial" },
  { label: "CRM", href: "/comercial/leads" },
  { label: "Pipeline", href: "/comercial/pipeline" },
  { label: "Strategies", href: "/comercial/estrategias" },
  { label: "Simulators", href: "/marketing/simuladores" },
  { label: "Clients", href: "/clientes" },
  { label: "Reports", href: "/reports" },
];

export const OPERATIONS_TABS: TopNavTab[] = [
  { label: "Projects", href: "/operacao/projetos" },
  { label: "Production", href: "/operacao/producao" },
  { label: "Deliveries", href: "/operacao/entregas" },
  { label: "Team", href: "/operacao/equipe" },
  { label: "Resources", href: "/operacao/conteudo" },
];

export const FINANCE_TABS: TopNavTab[] = [
  { label: "Dashboard", href: "/financeiro" },
  { label: "Revenue", href: "/financeiro/receitas" },
  { label: "Expenses", href: "/financeiro/despesas" },
  { label: "Costs", href: "/financeiro/custos" },
  { label: "Distribution", href: "/financeiro/distribuicao" },
  { label: "Receivables", href: "/financeiro/contas-a-receber" },
  { label: "Payables", href: "/financeiro/contas-a-pagar" },
];

export const SETTINGS_TABS: TopNavTab[] = [
  { label: "Company", href: "/configuracoes/empresa" },
  { label: "Users", href: "/configuracoes/usuarios" },
  { label: "Financial Rules", href: "/configuracoes/regras-financeiras" },
];
