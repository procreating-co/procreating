"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpAction, type SignUpFormState } from "@/app/admin/signup/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ADMIN_LOGIN_PATH } from "@/lib/admin/auth/constants";

const initialState: SignUpFormState = undefined;

/** Mesmo padrão visual de `components/admin/login-form.tsx` — só o formulário tem um campo a mais (nome). */
export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signUpAction, initialState);

  return (
    <Card className="w-full max-w-sm border-border/60 bg-card/60 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-2xl">Cadastro</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" type="text" autoComplete="name" required autoFocus />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" autoComplete="username" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Senha</Label>
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
          <Link href={ADMIN_LOGIN_PATH} className="text-center text-sm text-muted-foreground transition-colors hover:text-foreground">
            Já tem conta? Entrar
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}
