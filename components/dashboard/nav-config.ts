import { Layers, LayoutDashboard, Sun, TrendingUp, Wallet, type LucideIcon } from "lucide-react";

/**
 * Navegação do shell interno (Procreating OS) — reescrita completa nesta fase (sidebar
 * hover-to-expand + top nav contextual). Antes disso existiam 7 grupos colapsáveis na própria
 * sidebar (accordion com submenu) mais um `DASHBOARD_SECTIONS` separado (grade de cards em
 * `/operacao` e `/administracao`) — os dois são substituídos por isto: 5 grupos fixos na
 * sidebar (nunca submenu ali) + uma lista de abas por grupo, renderizada como top nav contextual
 * dentro do `dashboard-header.tsx` (que resolve a área atual direto por `NAV_GROUPS`, sem manter
 * uma segunda lista de prefixos em paralelo — era assim antes e um dos dois ficou desatualizado
 * quando Clientes mudou de área, a raiz do bug).
 *
 * Casca de navegação (rótulos de grupo e de aba) em português — mesma língua do resto do produto.
 *
 * URLs não foram renomeadas: cada aba aponta pra uma rota que já existe (ou, quando marcado, uma
 * nova) — a reestruturação é de navegação, não uma tradução de rota.
 */
export type TopNavTab = { label: string; href: string };

/** Visão Geral (métricas comerciais reais, já existia em `/comercial`) foi acrescentada além da
 *  lista literal do pedido (CRM/Pipeline/Estratégias/Simuladores/Relatórios) — sem ela, conteúdo
 *  real perderia navegação. Relatórios não existe ainda: `ComingSoon`. Clientes NÃO está aqui —
 *  pertence à Operação (dono da entrega/relação contínua), não ao Comercial (dono da conquista do
 *  lead) — corrigido depois de ter ficado em Growth por engano numa fase anterior. */
export const GROWTH_TABS: TopNavTab[] = [
  { label: "Visão Geral", href: "/comercial" },
  { label: "CRM", href: "/comercial/leads" },
  { label: "Pipeline", href: "/comercial/pipeline" },
  { label: "Estratégias", href: "/comercial/estrategias" },
  { label: "Simuladores", href: "/marketing/simuladores" },
  { label: "Relatórios", href: "/reports" },
];

/** Clientes (visão 360º, `/clientes`) mora aqui — não em Growth (ver comentário acima). */
export const OPERATIONS_TABS: TopNavTab[] = [
  { label: "Clientes", href: "/clientes" },
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

/** Não vive num grupo de `NAV_GROUPS` (Settings só existe no rodapé da sidebar, ver comentário
 *  abaixo) — `dashboard-header.tsx` trata `/configuracoes` como um caso à parte por isso. */
export const SETTINGS_TABS: TopNavTab[] = [
  { label: "Geral", href: "/configuracoes/geral" },
  { label: "Empresa", href: "/configuracoes/empresa" },
  { label: "Usuários", href: "/configuracoes/usuarios" },
  { label: "Regras Financeiras", href: "/configuracoes/regras-financeiras" },
];

export type NavGroupKey = "workspace" | "dashboard" | "operations" | "growth" | "finance" | "settings";

export type NavGroupDef = {
  key: NavGroupKey;
  label: string;
  icon: LucideIcon;
  /** Rota que o clique no ícone da sidebar abre. */
  href: string;
  /** Prefixos de rota que contam como "este grupo está ativo". */
  matchPrefixes: string[];
  /** Abas do top nav dessa área — `undefined` pras duas páginas únicas sem sub-navegação
   *  (Workspace, Dashboard). Única fonte pro top nav — `dashboard-header.tsx` lê daqui direto,
   *  não existe mais um array de prefixos duplicado em paralelo. */
  tabs?: TopNavTab[];
};

/**
 * Settings NÃO está aqui — só existe uma vez no rodapé da sidebar (perto do avatar/toggle de
 * tema, `dashboard-sidebar.tsx`), não duplicado como um 6º ícone de grupo aqui. `/configuracoes`
 * continua coberto (só não por um grupo desta lista) — o link do rodapé leva pra lá, e
 * `SETTINGS_TABS` é tratado como caso à parte em `dashboard-header.tsx`.
 */
export const NAV_GROUPS: NavGroupDef[] = [
  { key: "workspace", label: "Workspace", icon: Sun, href: "/meu-dia", matchPrefixes: ["/meu-dia"] },
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/", matchPrefixes: ["/"] },
  { key: "operations", label: "Operação", icon: Layers, href: "/operacao", matchPrefixes: ["/operacao", "/clientes"], tabs: OPERATIONS_TABS },
  { key: "growth", label: "Comercial", icon: TrendingUp, href: "/comercial", matchPrefixes: ["/comercial", "/marketing", "/reports"], tabs: GROWTH_TABS },
  { key: "finance", label: "Financeiro", icon: Wallet, href: "/financeiro", matchPrefixes: ["/financeiro"], tabs: FINANCE_TABS },
];
