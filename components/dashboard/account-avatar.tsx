import { cn } from "@/lib/utils";

export type AccountMenuUser = { name: string; email: string; avatarUrl: string | null };

/**
 * Monograma quando não há foto ainda — `avatarUrl` real assim que existir (upload via
 * `ProfileEditDialog`). Mesmo componente pro gatilho pequeno na sidebar, pro cabeçalho do menu de
 * conta e pra prévia grande dentro do modal de edição. Arquivo próprio (era parte de
 * `account-menu.tsx`) pra `account-menu.tsx` e `profile-edit-dialog.tsx` poderem importar os dois
 * sem import circular entre eles (o menu abre o modal, o modal precisa do mesmo avatar do menu).
 */
export function AccountAvatar({ user, className }: { user: { name: string; avatarUrl: string | null }; className?: string }) {
  if (user.avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- URL pública do Storage, fora do
    // domínio configurado pro next/image; é só uma foto de perfil pequena, sem necessidade de
    // otimização.
    return <img src={user.avatarUrl} alt="" className={cn("shrink-0 rounded-full object-cover", className)} />;
  }
  return <div className={cn("flex shrink-0 items-center justify-center rounded-full bg-foreground/10 font-mono uppercase text-muted-foreground", className)}>{user.name.slice(0, 2)}</div>;
}
