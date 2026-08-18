"use client";

import { useState } from "react";
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

/** Conteúdo da sidebar (logo, 6 grupos, rodapé) — compartilhado entre a versão desktop (hover,
 *  `w-16`↔`w-64`) e a versão mobile (drawer, sempre expandida — não faz sentido "recolher pra só
 *  ícone" dentro de um painel que já ocupa a tela toda). `onNavigate` fecha o drawer mobile ao
 *  clicar num link; `undefined` no desktop (nada a fechar). */
function SidebarContent({ expanded, user, onNavigate }: { expanded: boolean; user: AdminUser; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Logo = também um atalho pro Workspace (`/workspace`, era `/meu-dia`) — redundante com o
       *  ícone de Workspace logo abaixo (pedido explícito: ícone de casa próprio, acima do
       *  Dashboard), mas mantido: é convenção comum (logo sempre leva pro "home") e não
       *  atrapalha. `px-2.5` (não `px-4`) — mesmo eixo esquerdo do slot dos ícones de grupo e do
       *  avatar no rodapé (ver comentário lá embaixo). O símbolo agora mora no MESMO slot
       *  centralizado `size-7` deles (antes era um `size-7` cru, preenchendo a caixa borda a
       *  borda — ficava sem o mesmo recuo óptico que os ícones de linha ganharam, então o logo
       *  parecia "puxado" pra esquerda comparado ao resto da coluna). `size-6` dentro do slot
       *  `size-7` mantém o peso visual maior que um ícone de linha comum, só um pouco menor pra
       *  caber com o mesmo recuo. */}
      <Link href="/workspace" onClick={onNavigate} className="flex h-16 shrink-0 items-center gap-2.5 px-2.5">
        <span className="flex size-7 shrink-0 items-center justify-center">
          <ProcreatingMark className="size-6 text-foreground" />
        </span>
        <span className={cn("overflow-hidden whitespace-nowrap font-display text-lg tracking-tight transition-opacity duration-150", expanded ? "opacity-100" : "w-0 opacity-0")}>
          Procreating OS
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2.5 py-2">
        {NAV_GROUPS.map((group) => {
          const Icon = group.icon;
          const active = group.matchPrefixes.some((prefix) => (prefix === "/" ? pathname === "/" : pathname === prefix || pathname.startsWith(`${prefix}/`)));
          return (
            <Link
              key={group.key}
              href={group.href}
              onClick={onNavigate}
              title={expanded ? undefined : group.label}
              className={cn(
                "group relative flex items-center rounded-md px-2.5 py-2 text-sm transition-colors",
                active ? "bg-sidebar-accent text-brand" : "text-sidebar-muted-foreground hover:bg-sidebar-hover hover:text-sidebar-foreground"
              )}
            >
              {/* Slot fixo `size-7` centralizando o ícone (já corrigido numa rodada anterior).
               *  Causa estrutural do novo desalinhamento reportado (fundo/borda do item ativo
               *  deslocado do centro do ícone): o espaçamento ícone↔label vivia em `gap-3` no
               *  container flex — um `gap` é reservado ENTRE filhos independente da largura de
               *  cada um, então mesmo com o label colapsado (`w-0`) na sidebar recolhida, os 12px
               *  do gap continuavam contando pro fundo/hover do item (aplicado no `<Link>`
               *  inteiro). Com padding simétrico (`px-2.5` nos dois lados) mas um filho "fantasma"
               *  de 12px só do lado direito do ícone, o retângulo do fundo ativo ficava mais largo
               *  à direita do ícone que à esquerda — o ícone parecia puxado pra esquerda dentro do
               *  próprio destaque. Fix: o espaçamento agora é `margin-left` NO PRÓPRIO label
               *  (`ml-3` só quando expandido, `ml-0` junto com `w-0` quando recolhido) — colapsa
               *  de verdade a zero, não só a largura. Recolhido, o fundo vira só
               *  `padding + slot do ícone`, simétrico dos dois lados → ícone exatamente no centro. */}
              <span className="flex size-7 shrink-0 items-center justify-center">
                <Icon className="size-4.5" />
              </span>
              <span
                className={cn(
                  "overflow-hidden whitespace-nowrap transition-all duration-150",
                  expanded ? "ml-3 opacity-100" : "ml-0 w-0 opacity-0"
                )}
              >
                {group.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/60 p-2.5">
        {/* `size-7` é o mesmo slot dos ícones de grupo acima (o `<span>` que embrulha cada
         *  `Icon`) — antes o avatar (círculo `size-7`, 28px) ficava ancorado só pela borda
         *  esquerda do padding, igual aos ícones de linha (18px), então os dois "pareciam"
         *  alinhados pela esquerda mas ficavam ópticamente desencontrados na coluna recolhida
         *  (o avatar, mais largo, puxava o olho mais pra direita). Com o mesmo slot de 28px
         *  centralizando cada ícone, a coluna fica reta independente do tamanho do glifo lá
         *  dentro. */}
        {/* Mesmo fix de espaçamento do nav acima (`ml-3`/`ml-0` no filho colapsável em vez de
         *  `gap-3` no pai) — mesma estrutura, mesmo bug de fundo/hover deslocado do centro do
         *  ícone/avatar quando recolhido. */}
        <AccountMenu user={{ name: user.name, email: user.email, avatarUrl: user.avatarUrl }}>
          <button type="button" className="flex w-full items-center rounded-md px-2.5 py-2 text-left text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-hover">
            <AccountAvatar user={user} className="size-7 shrink-0 text-[10px]" />
            <div
              className={cn(
                "min-w-0 flex-1 overflow-hidden transition-all duration-150",
                expanded ? "ml-3 opacity-100" : "ml-0 w-0 opacity-0"
              )}
            >
              <p className="truncate text-sm">{user.name}</p>
              <p className="truncate text-xs text-sidebar-muted-foreground">{user.email}</p>
            </div>
          </button>
        </AccountMenu>

        <Link
          href="/configuracoes"
          onClick={onNavigate}
          title={expanded ? undefined : "Configurações"}
          className="mt-1 flex items-center rounded-md px-2.5 py-2 text-sm text-sidebar-muted-foreground transition-colors hover:bg-sidebar-hover hover:text-sidebar-foreground"
        >
          <span className="flex size-7 shrink-0 items-center justify-center">
            <Settings className="size-4" />
          </span>
          <span
            className={cn(
              "overflow-hidden whitespace-nowrap transition-all duration-150",
              expanded ? "ml-3 opacity-100" : "ml-0 w-0 opacity-0"
            )}
          >
            Configurações
          </span>
        </Link>
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
