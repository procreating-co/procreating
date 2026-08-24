"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { inviteClientPortalUserAction, revokeClientPortalInviteAction } from "@/lib/clientes/portal-invite-actions";
import type { ClientPortalInviteRow } from "@/lib/supabase/types/database";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

/** "Acesso ao Portal" — Fase B2. Convite mesmo padrão de `team_invites`: a pessoa se cadastra
 *  sozinha em `/portal/signup` com o e-mail convidado, nunca criamos a conta por ela aqui. */
export function PortalAccessSection({ clientId, invites }: { clientId: string; invites: ClientPortalInviteRow[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleInvite() {
    setError(null);
    startTransition(async () => {
      const result = await inviteClientPortalUserAction(clientId, name, email);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setName("");
      setEmail("");
      setCreating(false);
      router.refresh();
    });
  }

  function handleRevoke(inviteId: string) {
    startTransition(async () => {
      await revokeClientPortalInviteAction(inviteId, clientId);
      router.refresh();
    });
  }

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Acesso ao Portal</h2>
        {!creating && (
          <Button type="button" variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={() => setCreating(true)}>
            <Plus className="size-3" />
            Convidar
          </Button>
        )}
      </div>

      {invites.length === 0 && !creating ? (
        <p className="text-sm text-muted-foreground">Nenhum convite enviado ainda.</p>
      ) : (
        <ul className="flex flex-col gap-2 text-sm">
          {invites.map((invite) => (
            <li key={invite.id} className="group flex items-center justify-between gap-2">
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">{invite.name}</span>
                <span className="text-xs text-muted-foreground">{invite.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {invite.used_at ? `Ativo desde ${dateFormatter.format(new Date(invite.used_at))}` : "Convite pendente"}
                </span>
                {!invite.used_at && (
                  <button
                    type="button"
                    onClick={() => handleRevoke(invite.id)}
                    aria-label={`Revogar convite de ${invite.name}`}
                    className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {creating && (
        <div className="flex flex-col gap-2 border-t border-border/60 pt-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="portal-invite-name">Nome</Label>
            <Input id="portal-invite-name" value={name} onChange={(event) => setName(event.target.value)} autoFocus />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="portal-invite-email">E-mail</Label>
            <Input id="portal-invite-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="button" size="sm" disabled={isPending} onClick={handleInvite}>
              {isPending ? "Convidando..." : "Enviar convite"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setCreating(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
