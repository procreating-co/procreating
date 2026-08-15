"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createContactAction, updateContactAction, type ContactFormInput } from "@/lib/clientes/contact-actions";
import type { ClientContact } from "@/lib/supabase/types/database";

function toFormInput(contact?: ClientContact): ContactFormInput {
  return {
    name: contact?.name ?? "",
    roleTitle: contact?.role_title ?? "",
    email: contact?.email ?? "",
    whatsapp: contact?.whatsapp ?? "",
    isPrimary: contact?.is_primary ?? false,
  };
}

/** Único dialog pra criar E editar contato — `contact` presente = edição. */
export function ContactFormDialog({
  clientId,
  contact,
  open,
  onOpenChange,
}: {
  clientId: string;
  contact?: ClientContact;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ContactFormInput>(() => toFormInput(contact));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function reset() {
    setForm(toFormInput(contact));
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = contact ? await updateContactAction(contact.id, clientId, form) : await createContactAction(clientId, form);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-md gap-5">
        <DialogHeader>
          <DialogTitle>{contact ? "Editar contato" : "Novo contato"}</DialogTitle>
          <DialogDescription>Quem falar no dia a dia deste cliente.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="contact-name">Nome</Label>
            <Input id="contact-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required autoFocus />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="contact-role">Cargo</Label>
            <Input id="contact-role" value={form.roleTitle} onChange={(e) => setForm((f) => ({ ...f, roleTitle: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="contact-whatsapp">WhatsApp</Label>
              <Input id="contact-whatsapp" value={form.whatsapp} onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="contact-email">E-mail</Label>
              <Input id="contact-email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={form.isPrimary}
              onChange={(e) => setForm((f) => ({ ...f, isPrimary: e.target.checked }))}
              className="size-3.5 rounded border-input"
            />
            Contato principal
          </label>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : contact ? "Salvar alterações" : "Adicionar contato"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
