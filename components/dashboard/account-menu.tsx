"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { LogOut, Settings } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/app/admin/(protected)/actions";
import { ProfileEditDialog } from "@/components/dashboard/profile-edit-dialog";
import { AccountAvatar, type AccountMenuUser } from "@/components/dashboard/account-avatar";

/**
 * Bloco avatar/nome/email no topo do menu virou o gatilho do `ProfileEditDialog` — pedido
 * explícito ("ao clicar no nome deve abrir um modal pra editar o perfil, igual sites
 * profissionais"), mesma convenção de Slack/Notion/Linear (clicar no cabeçalho do menu de conta
 * abre a edição, não fica só informativo). Upload de foto e nome editável moraram pro modal;
 * "XP e conquistas" — era só um item desabilitado ("em desenvolvimento"), sem informação real
 * atrás, removido (a Fase 6 que descrever a feature de verdade decide onde ela mora, não aqui).
 * Tema NÃO está duplicado aqui — já tem um toggle de 1 clique no rodapé da sidebar, ao lado de
 * Configurações.
 */
export function AccountMenu({ user, children }: { user: AccountMenuUser; children: ReactNode }) {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="right" sideOffset={8} className="w-64">
        <DropdownMenuItem className="flex items-center gap-3 px-2 py-2" onSelect={() => setProfileOpen(true)}>
          <AccountAvatar user={user} className="size-9 text-sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/configuracoes">
            <Settings className="size-4 text-muted-foreground" />
            Configurações
          </Link>
        </DropdownMenuItem>
        <form action={signOutAction}>
          <button
            type="submit"
            className="relative flex w-full cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground"
          >
            <LogOut className="size-4 text-muted-foreground" />
            Sair
          </button>
        </form>
      </DropdownMenuContent>
      <ProfileEditDialog user={user} open={profileOpen} onOpenChange={setProfileOpen} />
    </DropdownMenu>
  );
}
