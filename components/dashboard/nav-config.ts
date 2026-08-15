import { Home, Layers, LayoutDashboard, TrendingUp, Wallet, type LucideIcon } from "lucide-react";

/**
 * Navegação do shell interno (Procreating OS) — reescrita completa nesta fase (sidebar
 * hover-to-expand + top nav contextual). Antes disso existiam 7 grupos colapsáveis na própria
 * sidebar (accordion com submenu) mais um `DASHBOARD_SECTIONS` separado (grade de cards em
 * `/operacao` e `/administracao`) — os dois são substituídos por isto: 5 grupos fixos na
 * sidebar (nunca submenu ali) + uma lista de abas por grupo (só pras áreas que ainda têm
 * sub-rotas de verdade), renderizada como top nav contextual dentro do `dashboard-header.tsx`
 * (que resolve a área atual direto por `NAV_GROUPS`, sem manter uma segunda lista de prefixos em
 * paralelo — era assim antes e um dos dois ficou desatualizado quando Clientes mudou de área, a
 * raiz do bug).
 *
 * Growth e Finance NÃO têm mais `tabs` aqui — cada um virou uma rota só
 * (`/comercial`, `/financeiro`) com abas internas (`components/dashboard/page-tabs.tsx`, dentro
 * da própria página) no lugar de sub-rotas. Manter um array de tabs aqui pra essas duas áreas
 * recriaria a mesma duplicação de navegação (duas barras de aba) que foi corrigida quando o
 * header e o top-nav antigo foram unificados.
 *
 * Casca de navegação (rótulos de grupo e de aba) em português — mesma língua do resto do produto.
 */
export type TopNavTab = { label: string; href: string };

/** Clientes (visão 360º, `/clientes`) mora aqui — não em Growth (é a Operação que é dona da
 *  entrega/relação contínua com o cliente, não o Comercial, que é dono da conquista do lead). */
export const OPERATIONS_TABS: TopNavTab[] = [
  { label: "Clientes", href: "/clientes" },
  { label: "Projetos", href: "/operacao/projetos" },
  { label: "Produção", href: "/operacao/producao" },
  { label: "Entregas", href: "/operacao/entregas" },
  { label: "Equipe", href: "/operacao/equipe" },
  { label: "Recursos", href: "/operacao/conteudo" },
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
  /** Abas do top nav dessa área — `undefined` pras páginas que são uma rota só, sem sub-navegação
   *  externa (Workspace, Dashboard, Growth, Finance — as duas últimas têm abas, só que internas
   *  à própria página, não aqui). Única fonte pro top nav quando existe — `dashboard-header.tsx`
   *  lê daqui direto, não existe um array de prefixos duplicado em paralelo. */
  tabs?: TopNavTab[];
};

/**
 * Settings NÃO está aqui — só existe uma vez no rodapé da sidebar (perto do avatar/toggle de
 * tema, `dashboard-sidebar.tsx`), não duplicado como um 6º ícone de grupo aqui. `/configuracoes`
 * continua coberto (só não por um grupo desta lista) — o link do rodapé leva pra lá, e
 * `SETTINGS_TABS` é tratado como caso à parte em `dashboard-header.tsx`.
 */
export const NAV_GROUPS: NavGroupDef[] = [
  { key: "workspace", label: "Workspace", icon: Home, href: "/workspace", matchPrefixes: ["/workspace"] },
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/", matchPrefixes: ["/"] },
  { key: "operations", label: "Operação", icon: Layers, href: "/operacao", matchPrefixes: ["/operacao", "/clientes"], tabs: OPERATIONS_TABS },
  { key: "growth", label: "Comercial", icon: TrendingUp, href: "/comercial", matchPrefixes: ["/comercial"] },
  { key: "finance", label: "Financeiro", icon: Wallet, href: "/financeiro", matchPrefixes: ["/financeiro"] },
];
