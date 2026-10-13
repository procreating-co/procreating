/**
 * Mostrado quando o painel (agora público, sem login) não conseguiu estabelecer a sessão da conta
 * de serviço — ou seja, `ADMIN_AUTO_EMAIL`/`ADMIN_AUTO_PASSWORD` não estão configuradas no
 * ambiente, ou apontam pra uma conta owner que não existe/não loga no Supabase Auth. Em vez de
 * redirecionar pra uma tela de login que não existe mais (o que viraria loop) ou estourar 500,
 * damos uma instrução clara de configuração. Ver `lib/admin/auth/auto-login.ts`.
 */
export function AutoLoginMissing() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md space-y-3 rounded-lg border border-border/60 bg-card/60 p-6 text-sm text-foreground backdrop-blur">
        <h1 className="text-base font-semibold">Painel aberto, falta só 1 chave</h1>
        <p className="text-muted-foreground">
          O login foi removido: o painel entra sozinho numa conta de serviço owner (criada automaticamente). Pra isso
          funcionar, defina no Vercel → Settings → Environment Variables a variável{" "}
          <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code> (o valor está no Supabase → Settings → API →{" "}
          <code className="font-mono">service_role</code>) e faça um novo deploy. Nenhum outro passo é necessário.
        </p>
      </div>
    </main>
  );
}
