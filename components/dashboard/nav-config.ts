import { Layers, LayoutDashboard, Sun, TrendingUp, Wallet, type LucideIcon } from "lucide-react";

/**
 * Navegação do shell interno (Procreating OS) — reescrita completa nesta fase (sidebar
 * hover-to-expand + top nav contextual). Antes disso existiam 7 grupos colapsáveis na própria
 * sidebar (accordion com submenu) mais um `DASHBOARD_SECTIONS` separado (grade de cards em
 * `/operacao` e `/administracao`) — os dois são substituídos por isto: 6 grupos fixos na
 * sidebar (nunca submenu ali) + uma lista de abas por grupo, renderizada como top nav contextual
 * dentro do `layout.tsx` de cada área (`components/dashboard/top-nav.tsx`).
 *
 * Casca de navegação (rótulos de grupo e de aba) em português — mesma língua do resto do produto.
 * (Chegou a ir pra inglês por um pedido explícito numa fase anterior; revertido por pedido novo.)
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

/**
 * Settings NÃO está aqui — só existe uma vez no rodapé da sidebar (perto do avatar/toggle de
 * tema, `dashboard-sidebar.tsx`), não duplicado como um 7º ícone de grupo aqui. `matchPrefixes`
 * de `/configuracoes` continua coberto (só não por um grupo desta lista) — o link do rodapé leva
 * pra lá, e `SETTINGS_TABS`/`TopNav` seguem funcionando normalmente por dentro da página.
 */
export const NAV_GROUPS: NavGroupDef[] = [
  { key: "workspace", label: "Workspace", icon: Sun, href: "/meu-dia", matchPrefixes: ["/meu-dia"] },
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/", matchPrefixes: ["/"] },
  { key: "operations", label: "Operação", icon: Layers, href: "/operacao", matchPrefixes: ["/operacao"] },
  { key: "growth", label: "Comercial", icon: TrendingUp, href: "/comercial", matchPrefixes: ["/comercial", "/marketing", "/clientes", "/reports"] },
  { key: "finance", label: "Financeiro", icon: Wallet, href: "/financeiro", matchPrefixes: ["/financeiro"] },
];

export type TopNavTab = { label: string; href: string };

/** Meu Dia é o conteúdo real de sempre; Tarefas é nova (todas as tarefas do usuário, não só as de
 *  hoje); Calendário/Inbox ainda não têm entidade nenhuma por trás — `ComingSoon`. Conquistas é o
 *  workspace gamificado (XP/streak/timer/conquistas), nova nesta fase. */
export const WORKSPACE_TABS: TopNavTab[] = [
  { label: "Meu Dia", href: "/meu-dia" },
  { label: "Tarefas", href: "/meu-dia/tarefas" },
  { label: "Calendário", href: "/meu-dia/calendario" },
  { label: "Inbox", href: "/meu-dia/inbox" },
  { label: "Conquistas", href: "/meu-dia/conquistas" },
];

/** Visão Geral (métricas comerciais reais, já existia em `/comercial`) e Clientes (visão 360º,
 *  `/clientes`) foram acrescentadas além da lista literal do pedido (CRM/Pipeline/Estratégias/
 *  Simuladores/Relatórios) — sem elas, conteúdo real perderia navegação. Relatórios não existe
 *  ainda: `ComingSoon`. */
export const GROWTH_TABS: TopNavTab[] = [
  { label: "Visão Geral", href: "/comercial" },
  { label: "CRM", href: "/comercial/leads" },
  { label: "Pipeline", href: "/comercial/pipeline" },
  { label: "Estratégias", href: "/comercial/estrategias" },
  { label: "Simuladores", href: "/marketing/simuladores" },
  { label: "Clientes", href: "/clientes" },
  { label: "Relatórios", href: "/reports" },
];

export const OPERATIONS_TABS: TopNavTab[] = [
  { label: "Projetos", href: "/operacao/projetos" },
  { label: "Produção", href: "/operacao/producao" },
  { label: "Entregas", href: "/operacao/entregas" },
  { label: "Equipe", href: "/operacao/equipe" },
  { label: "Recursos", href: "/operacao/conteudo" },
];

export const FINANCE_TABS: TopNavTab[] = [
  { label: "Dashboard", href: "/financeiro" },
  { label: "Receitas", href: "/financeiro/receitas" },
  { label: "Despesas", href: "/financeiro/despesas" },
  { label: "Custos", href: "/financeiro/custos" },
  { label: "Distribuição", href: "/financeiro/distribuicao" },
  { label: "Contas a Receber", href: "/financeiro/contas-a-receber" },
  { label: "Contas a Pagar", href: "/financeiro/contas-a-pagar" },
];

export const SETTINGS_TABS: TopNavTab[] = [
  { label: "Geral", href: "/configuracoes/geral" },
  { label: "Empresa", href: "/configuracoes/empresa" },
  { label: "Usuários", href: "/configuracoes/usuarios" },
  { label: "Regras Financeiras", href: "/configuracoes/regras-financeiras" },
];
