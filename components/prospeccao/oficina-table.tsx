"use client";

import { useRef, useState } from "react";
import { Check, Copy, MessageCircle, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OficinaFormDialog } from "@/components/prospeccao/oficina-form-dialog";
import { useOficinas } from "@/components/prospeccao/oficinas-store";
import { STATUS_LABEL, STATUS_TONE_CLASSES, buildProspeccaoMessage, buildWhatsAppUrl } from "@/lib/prospeccao/mock-data";
import type { Oficina } from "@/lib/prospeccao/types";
import { cn } from "@/lib/utils";

const COPY_FEEDBACK_MS = 1600;

function CopyButton({ oficina }: { oficina: Oficina }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handleCopy() {
    await navigator.clipboard.writeText(buildProspeccaoMessage(oficina));
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
  }

  return (
    <div className="relative inline-flex">
      {copied && (
        <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-black px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-white shadow-xl animate-[toast-in_200ms_ease-out_both]">
          Copiado!
        </span>
      )}
      <Button type="button" variant="ghost" size="icon-sm" onClick={handleCopy} aria-label="Copiar mensagem de prospecção" title="Copiar mensagem">
        {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
      </Button>
    </div>
  );
}

function StatusBadge({ status }: { status: Oficina["status"] }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-xs whitespace-nowrap", STATUS_TONE_CLASSES[status])}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function OficinaTable({ oficinas }: { oficinas: Oficina[] }) {
  const { updateOficina, removeOficina } = useOficinas();
  const [editing, setEditing] = useState<Oficina | null>(null);
  const [deleting, setDeleting] = useState<Oficina | null>(null);

  if (oficinas.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.02] px-6 py-16 text-center text-white/40">
        Nenhuma oficina encontrada com esses filtros.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02]">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead className="text-white/50">Oficina</TableHead>
            <TableHead className="text-white/50">Cidade</TableHead>
            <TableHead className="text-white/50">Responsável</TableHead>
            <TableHead className="text-white/50">Status</TableHead>
            <TableHead className="text-white/50">Observações</TableHead>
            <TableHead className="text-right text-white/50">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {oficinas.map((oficina) => (
            <TableRow key={oficina.id} className="border-white/5">
              <TableCell className="font-medium text-white">{oficina.nome}</TableCell>
              <TableCell className="text-white/70">{oficina.cidade}</TableCell>
              <TableCell className="text-white/70">{oficina.responsavel}</TableCell>
              <TableCell>
                <StatusBadge status={oficina.status} />
              </TableCell>
              <TableCell className="max-w-[220px] truncate text-white/50" title={oficina.observacoes || undefined}>
                {oficina.observacoes || "—"}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button asChild variant="ghost" size="icon-sm" title="Abrir conversa no WhatsApp">
                    <a href={buildWhatsAppUrl(oficina.whatsapp, buildProspeccaoMessage(oficina))} target="_blank" rel="noopener noreferrer" aria-label="Abrir conversa no WhatsApp">
                      <MessageCircle className="size-4 text-emerald-400" />
                    </a>
                  </Button>
                  <CopyButton oficina={oficina} />
                  <Button type="button" variant="ghost" size="icon-sm" onClick={() => setEditing(oficina)} aria-label="Editar oficina" title="Editar">
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setDeleting(oficina)}
                    aria-label="Excluir oficina"
                    title="Excluir"
                  >
                    <Trash2 className="size-4 text-red-400" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <OficinaFormDialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        oficina={editing ?? undefined}
        onSubmit={(input) => editing && updateOficina(editing.id, input)}
      />

      <Dialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir oficina?</DialogTitle>
            <DialogDescription>
              {deleting ? `"${deleting.nome}" será removida da lista de prospecção. Essa ação não pode ser desfeita.` : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleting(null)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (deleting) removeOficina(deleting.id);
                setDeleting(null);
              }}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
