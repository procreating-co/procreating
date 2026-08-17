"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { revokeInviteAction } from "@/lib/admin/auth/actions";

export function RevokeInviteButton({ inviteId, name }: { inviteId: string; name: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await revokeInviteAction(inviteId);
      setConfirming(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label={`Revogar convite de ${name}`}
        className="rounded p-1 text-muted-foreground transition-colors hover:text-destructive"
      >
        <X className="size-3.5" />
      </button>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Revogar convite?"
        description={`"${name}" não vai mais conseguir se cadastrar com esse e-mail em /admin/signup — some pra sempre, não dá pra desfazer.`}
        confirmLabel="Revogar"
        isPending={isPending}
        onConfirm={handleConfirm}
      />
    </>
  );
}
