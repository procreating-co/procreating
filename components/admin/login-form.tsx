"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInAction, type SignInFormState } from "@/app/admin/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ADMIN_SIGNUP_PATH } from "@/lib/admin/auth/constants";

const initialState: SignInFormState = undefined;

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(signInAction, initialState);

  return (
    <Card className="w-full max-w-sm border-border/60 bg-card/60 backdrop-blur">
      <CardHeader>
        <CardTitle className="font-display text-2xl">Painel Procreating</CardTitle>
        <CardDescription>Acesso restrito à equipe.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" autoComplete="username" required autoFocus />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          {state?.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}
          <Button type="submit" disabled={isPending} className="mt-2">
            {isPending ? "Entrando..." : "Entrar"}
          </Button>
          <Link href={ADMIN_SIGNUP_PATH} className="text-center text-sm text-muted-foreground transition-colors hover:text-foreground">
            Primeiro acesso? Cadastre-se
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}
