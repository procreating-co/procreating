"use client";

import { signOutAction } from "@/app/admin/(protected)/actions";
import { useAdminUser } from "@/lib/admin/auth/auth-context";
import { Button } from "@/components/ui/button";

/**
 * Placeholder da Etapa 1 — só prova que o fluxo de autenticação fecha (login → sessão →
 * contexto hidratado → logout). O dashboard de verdade (cards, tabela de projetos) é a
 * Etapa 2.
 */
export default function AdminHomePage() {
  const user = useAdminUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
      <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">Sessão mock ativa</p>
      <h1 className="font-display text-3xl">{user.name}</h1>
      <p className="text-sm text-muted-foreground">{user.email}</p>
      <form action={signOutAction}>
        <Button type="submit" variant="outline" className="mt-4">
          Sair
        </Button>
      </form>
    </main>
  );
}
