"use client";

import { useActionState } from "react";
import Link from "next/link";
import { portalSignUpAction, type PortalSignUpFormState } from "@/app/portal/signup/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PORTAL_LOGIN_PATH } from "@/lib/portal/auth/constants";

const initialState: PortalSignUpFormState = undefined;

/** Mesmo padrão de `components/admin/signup-form.tsx` — sem campo de nome (o nome já vem do
 *  convite, `client_portal_invites.name`, não é escolhido aqui). */
export function PortalSignupForm() {
  const [state, formAction, isPending] = useActionState(portalSignUpAction, initialState);

  return (
    <Card className="w-full max-w-sm border-border/60 bg-card/60 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-2xl">Ativar acesso</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">E-mail do convite</Label>
            <Input id="email" name="email" type="email" autoComplete="username" required autoFocus />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Crie uma senha</Label>
            <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
          </div>
          {state?.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}
          {state?.success && (
            <p role="status" className="text-sm text-emerald-500">
              {state.success}
            </p>
          )}
          <Button type="submit" disabled={isPending} className="mt-2">
            {isPending ? "Criando conta..." : "Criar conta"}
          </Button>
          <Link href={PORTAL_LOGIN_PATH} className="text-center text-sm text-muted-foreground transition-colors hover:text-foreground">
            Já tem conta? Entrar
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}
