import { portalSignOutAction } from "@/lib/portal/auth/actions";
import { Button } from "@/components/ui/button";

/** Header do Portal — deliberadamente simples: nome do cliente + sair, nada de navegação densa
 *  aqui (isso é `PortalNav`, abaixo). Nunca mostra dado interno (sem role/e-mail de staff, sem
 *  contagem de outros clientes). */
export function PortalHeader({ clientName }: { clientName: string }) {
  return (
    <header className="flex items-center justify-between border-b border-border/60 pb-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Portal do Cliente</p>
        <h1 className="font-display text-2xl">{clientName}</h1>
      </div>
      <form action={portalSignOutAction}>
        <Button type="submit" variant="ghost" size="sm">
          Sair
        </Button>
      </form>
    </header>
  );
}
