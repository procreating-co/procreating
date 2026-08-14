"use client";

import { useRef, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Camera, LogOut, Settings, Trophy } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { uploadAvatarAction } from "@/lib/account/actions";
import { signOutAction } from "@/app/admin/(protected)/actions";
import { cn } from "@/lib/utils";

export type AccountMenuUser = { name: string; email: string; avatarUrl: string | null };

/** Monograma quando não há foto ainda — `avatarUrl` real assim que existir (upload no próprio
 *  menu). Mesmo componente pro gatilho pequeno na sidebar e pro cabeçalho maior dentro do menu. */
export function AccountAvatar({ user, className }: { user: { name: string; avatarUrl: string | null }; className?: string }) {
  if (user.avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- URL pública do Storage, fora do
    // domínio configurado pro next/image; é só uma foto de perfil pequena, sem necessidade de
    // otimização.
    return <img src={user.avatarUrl} alt="" className={cn("shrink-0 rounded-full object-cover", className)} />;
  }
  return <div className={cn("flex shrink-0 items-center justify-center rounded-full bg-foreground/10 font-mono uppercase text-muted-foreground", className)}>{user.name.slice(0, 2)}</div>;
}

/**
 * Bloco avatar/nome/email vira um menu de verdade — antes era só informativo. Upload de foto real
 * (`uploadAvatarAction`, Supabase Storage — ver a migration `20260814240000_users_avatar_and_
 * storage.sql`), espaço reservado honesto pra XP/conquistas (a feature real foi revertida — Fase
 * 6 futura, isso aqui é só o lugar onde vai morar quando existir, sem inventar número), atalho
 * pra Configurações e Sair (reaproveita `signOutAction`, mesma action que `/configuracoes/geral`
 * já usa). Tema NÃO está duplicado aqui — já tem um toggle de 1 clique no rodapé da sidebar, ao
 * lado de Configurações.
 */
export function AccountMenu({ user, children }: { user: AccountMenuUser; children: ReactNode }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadAvatarAction(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="right" sideOffset={8} className="w-64">
        <DropdownMenuLabel className="flex items-center gap-3 px-2 py-2 font-normal">
          <AccountAvatar user={user} className="size-9 text-sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={isPending} onSelect={() => fileInputRef.current?.click()}>
          <Camera className="size-4 text-muted-foreground" />
          {isPending ? "Enviando..." : "Foto de perfil"}
        </DropdownMenuItem>
        <DropdownMenuItem disabled className="opacity-60">
          <Trophy className="size-4 text-muted-foreground" />
          XP e conquistas — em desenvolvimento
        </DropdownMenuItem>
        {error && <p className="px-2 py-1 text-xs text-destructive">{error}</p>}
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
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </DropdownMenu>
  );
}
