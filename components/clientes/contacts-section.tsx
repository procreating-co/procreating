"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ContactFormDialog } from "@/components/clientes/contact-form-dialog";
import { deleteContactAction } from "@/lib/clientes/contact-actions";
import type { ClientContact } from "@/lib/supabase/types/database";

/** "Editar cliente" completo — contato agora pode ser adicionado/editado/removido depois do
 *  onboarding (antes só nascia junto com o cliente, sem UI pra mudar). */
export function ContactsSection({ clientId, contacts }: { clientId: string; contacts: ClientContact[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editingContact, setEditingContact] = useState<ClientContact | null>(null);
  const [deletingContact, setDeletingContact] = useState<ClientContact | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  function handleDelete() {
    if (!deletingContact) return;
    startDeleteTransition(async () => {
      await deleteContactAction(deletingContact.id, clientId);
      setDeletingContact(null);
      router.refresh();
    });
  }

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Contatos</h2>
        <Button type="button" variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={() => setCreating(true)}>
          <Plus className="size-3" />
          Novo
        </Button>
      </div>

      {contacts.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum contato cadastrado.</p>
      ) : (
        <ul className="flex flex-col gap-3 text-sm">
          {contacts.map((contact) => (
            <li key={contact.id} className="group flex items-start justify-between gap-2">
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">
                  {contact.name} {contact.is_primary && <span className="text-xs text-muted-foreground">(principal)</span>}
                </span>
                {contact.role_title && <span className="text-xs text-muted-foreground">{contact.role_title}</span>}
                {contact.whatsapp && <span className="text-xs text-muted-foreground">{contact.whatsapp}</span>}
                {contact.email && <span className="text-xs text-muted-foreground">{contact.email}</span>}
              </div>
              <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button type="button" onClick={() => setEditingContact(contact)} aria-label={`Editar ${contact.name}`} className="rounded p-1 text-muted-foreground hover:text-foreground">
                  <Pencil className="size-3.5" />
                </button>
                <button type="button" onClick={() => setDeletingContact(contact)} aria-label={`Excluir ${contact.name}`} className="rounded p-1 text-muted-foreground hover:text-destructive">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ContactFormDialog clientId={clientId} open={creating} onOpenChange={setCreating} />
      {editingContact && (
        <ContactFormDialog key={editingContact.id} clientId={clientId} contact={editingContact} open onOpenChange={(open) => !open && setEditingContact(null)} />
      )}
      <ConfirmDialog
        open={deletingContact !== null}
        onOpenChange={(open) => !open && setDeletingContact(null)}
        title="Excluir contato?"
        description={deletingContact ? `"${deletingContact.name}" some da ficha do cliente — não dá pra desfazer.` : undefined}
        isPending={isDeleting}
        onConfirm={handleDelete}
      />
    </section>
  );
}
