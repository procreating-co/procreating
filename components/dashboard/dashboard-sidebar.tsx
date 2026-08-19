"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { useAdminUser } from "@/lib/admin/auth/auth-context";
import { NAV_GROUPS } from "@/components/dashboard/nav-config";
import { ProcreatingMark } from "@/components/dashboard/procreating-mark";
import { AccountMenu } from "@/components/dashboard/account-menu";
import { AccountAvatar } from "@/components/dashboard/account-avatar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type AdminUser = ReturnType<typeof useAdminUser>;

/** Slot de ícone único, usado por TODA a sidebar — logo, grupos de navegação, avatar de conta e
 *  Configurações. Um só componente, não 4 blocos de className copiados: garante por construção
 *  que os quatro fiquem sobre o mesmo eixo central, com a mesma área (`size-7`, 28px), mesmo
 *  `justify-content: center`/`align-items: center` — impossível um deles divergir sem querer,
 *  já que todos passam pelo mesmo código. Zero `position: absolute`/`translateX`/offset
 *  individual — centralização é sempre flexbox puro. */
function SidebarIconSlot({ children }: { children: ReactNode }) {
  return <span className="flex size-7 shrink-0 items-center justify-center">{children}</span>;
}

/** Label colapsável (nome do grupo/"Procreating OS"/e-mail/"Configurações") — espaçamento pro
 *  ícone vem de `margin-left` NO PRÓPRIO label (`ml-3` expandido, `ml-0` junto com `w-0`
 *  recolhido), nunca `gap` no container pai: um `gap` reserva espaço entre filhos mesmo com o
 *  label colapsado a `w-0`, o que empurra o retângulo de fundo ativo/hover pra um lado só do
 *  ícone (achado real, rodada anterior). Com `margin` no filho, o espaçamento colapsa de
 *  verdade — a caixa clicável recolhida vira só `padding + slot do ícone`, simétrica dos dois
 *  lados, ícone sempre no centro geométrico dela. `as="div"` pro botão de conta (nome + e-mail em
 *  2 linhas — conteúdo em bloco, `<p>` dentro de `<span>` seria HTML inválido). */
function SidebarLabel({ expanded, className, as: Tag = "span", children }: { expanded: boolean; className?: string; as?: "span" | "div"; children: ReactNode }) {
  return (
    <Tag className={cn("overflow-hidden whitespace-nowrap transition-all duration-150", expanded ? "ml-3 opacity-100" : "ml-0 w-0 opacity-0", className)}>{children}</Tag>
  );
}

/** Linha de navegação — MESMO container (`flex items-center rounded-md px-2.5 py-2`) do logo, do
 *  botão de conta e de Configurações, reaproveitado aqui em vez de repetido. `active` só muda a
 *  cor de fundo/texto, nunca a geometria (padding/altura/posição do ícone continuam idênticos
 *  entre item ativo e inativo — o pedido explícito de "o item ativo não pode ter uma caixa
 *  diferente dos demais" é garantido por isto usar o mesmo JSX pros dois estados, não um branch
 *  visual à parte). */
function SidebarNavRow({
  href,
  onClick,
  title,
  active,
  icon,
  label,
  expanded,
}: {
  href: string;
  onClick?: () => void;
  title?: string;
  active: boolean;
  icon: ReactNode;
  label: string;
  expanded: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      title={title}
      className={cn(
        "flex items-center rounded-md px-2.5 py-2 text-sm transition-colors",
        active ? "bg-sidebar-accent text-brand" : "text-sidebar-muted-foreground hover:bg-sidebar-hover hover:text-sidebar-foreground"
      )}
    >
      <SidebarIconSlot>{icon}</SidebarIconSlot>
      <SidebarLabel expanded={expanded}>{label}</SidebarLabel>
    </Link>
  );
}

/** Conteúdo da sidebar (logo, 6 grupos, rodapé) — compartilhado entre a versão desktop (hover,
 *  `w-16`↔`w-64`) e a versão mobile (drawer, sempre expandida — não faz sentido "recolher pra só
 *  ícone" dentro de um painel que já ocupa a tela toda). `onNavigate` fecha o drawer mobile ao
 *  clicar num link; `undefined` no desktop (nada a fechar).
 *
 * Estrutura (3 zonas, cada uma com sua função — nunca offset manual entre elas):
 * logo (altura fixa `h-16`) → nav (coluna flex, `flex-1`, empurra o rodapé pro fim) → rodapé
 * (`mt-auto` implícito por estar depois do `flex-1`, preso ao fundo pelo próprio layout, nunca
 * posicionamento absoluto). */
function SidebarContent({ expanded, user, onNavigate }: { expanded: boolean; user: AdminUser; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Logo = também um atalho pro Workspace (`/workspace`, era `/meu-dia`) — redundante com o
       *  ícone de Workspace logo abaixo (pedido explícito: ícone de casa próprio, acima do
       *  Dashboard), mas mantido: é convenção comum (logo sempre leva pro "home") e não
       *  atrapalha. Mesmo `SidebarIconSlot`/`SidebarLabel` do resto da sidebar — `size-6` (menor
       *  que o slot `size-7`) mantém o símbolo com peso visual de logo, não de ícone de linha
       *  comum, sem perder o mesmo eixo central dos outros. */}
      <Link href="/workspace" onClick={onNavigate} className="flex h-16 shrink-0 items-center px-2.5">
        <SidebarIconSlot>
          <ProcreatingMark className="size-6 text-foreground" />
        </SidebarIconSlot>
        <SidebarLabel expanded={expanded} className="font-display text-lg tracking-tight">
          Procreating OS
        </SidebarLabel>
      </Link>

      {/* SEM `px-2.5` aqui — causa real do desalinhamento reportado: `<nav>` tinha seu próprio
       *  `px-2.5` ENVOLVENDO `SidebarNavRow`, que também tem `px-2.5` (cada linha é responsável
       *  pelo próprio padding horizontal, de propósito — mesmo container que o logo usa). Os dois
       *  juntos empurravam o slot do ícone pra x=20px, enquanto o logo (sem container extra ao
       *  redor) ficava em x=10px — 10px de diferença real entre o eixo do logo e o eixo de todo o
       *  resto. Com só a linha controlando seu próprio `px-2.5`, todo mundo (logo, grupos,
       *  avatar, Configurações) fica na mesma borda esquerda, um padding só, nunca dois
       *  empilhados. */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto py-2">
        {NAV_GROUPS.map((group) => {
          const active = group.matchPrefixes.some((prefix) => (prefix === "/" ? pathname === "/" : pathname === prefix || pathname.startsWith(`${prefix}/`)));
          return (
            <SidebarNavRow
              key={group.key}
              href={group.href}
              onClick={onNavigate}
              title={expanded ? undefined : group.label}
              active={active}
              icon={<group.icon className="size-4.5" />}
              label={group.label}
              expanded={expanded}
            />
          );
        })}
      </nav>

      {/* Mesmo raciocínio do `<nav>` acima — `p-2.5` aqui SÓ o vertical (`py-2.5`), o horizontal
       *  fica só a cargo de cada linha (`AccountMenu`/`SidebarNavRow`), nunca empilhado. */}
      <div className="border-t border-border/60 py-2.5">
        <AccountMenu user={{ name: user.name, email: user.email, avatarUrl: user.avatarUrl }}>
          <button type="button" className="flex w-full items-center rounded-md px-2.5 py-2 text-left text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-hover">
            <SidebarIconSlot>
              <AccountAvatar user={user} className="size-7 text-[10px]" />
            </SidebarIconSlot>
            <SidebarLabel expanded={expanded} as="div" className="min-w-0 flex-1">
              <p className="truncate text-sm">{user.name}</p>
              <p className="truncate text-xs text-sidebar-muted-foreground">{user.email}</p>
            </SidebarLabel>
          </button>
        </AccountMenu>

        <div className="mt-1">
          <SidebarNavRow
            href="/configuracoes"
            onClick={onNavigate}
            title={expanded ? undefined : "Configurações"}
            active={false}
            icon={<Settings className="size-4" />}
            label="Configurações"
            expanded={expanded}
          />
        </div>
      </div>
    </>
  );
}

/**
 * Desktop (`lg` e acima): recolhida por padrão (`w-16`, só os 6 ícones de grupo) — expande no
 * hover (`w-64`) como **overlay** sobre o conteúdo (`fixed` + `z-index` alto + sombra), não
 * empurra o layout: `DashboardLayout` reserva `lg:pl-16` sempre, então nada dá reflow quando o
 * mouse passa por cima.
 *
 * Mobile/tablet (abaixo de `lg`): hover não existe em touch, então a sidebar vira um drawer
 * (`Sheet`) — aberto pelo botão de menu no `DashboardHeader`, estado compartilhado via
 * `DashboardLayout`. Fecha sozinho ao navegar.
 *
 * Nunca mostra submenu — cada grupo é um link direto pra sua área; a navegação de subseção é o
 * `TopNav` dentro de cada página.
 */
export function DashboardSidebar({ mobileOpen, onMobileOpenChange }: { mobileOpen: boolean; onMobileOpenChange: (open: boolean) => void }) {
  const user = useAdminUser();
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border/60 bg-sidebar transition-[width] duration-200 ease-out lg:flex",
          expanded ? "w-64 shadow-xl" : "w-16"
        )}
      >
        <SidebarContent expanded={expanded} user={user} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="w-72 p-0 lg:hidden">
          <SheetTitle className="sr-only">Navegação</SheetTitle>
          <SidebarContent expanded user={user} onNavigate={() => onMobileOpenChange(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
