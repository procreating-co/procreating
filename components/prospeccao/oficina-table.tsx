"use client";

import { useRef, useState } from "react";
import { Check, Copy, IdCard, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OficinaFormDialog } from "@/components/prospeccao/oficina-form-dialog";
import { StageBadge } from "@/components/prospeccao/stage-badge";
import { useOficinas } from "@/components/prospeccao/oficinas-store";
import type { Oficina } from "@/lib/prospeccao/types";

const COPY_FEEDBACK_MS = 1600;

function CopyCelularButton({ oficina }: { oficina: Oficina }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handleCopy() {
    await navigator.clipboard.writeText(oficina.whatsapp);
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
      <Button type="button" variant="ghost" size="icon-sm" onClick={handleCopy} aria-label="Copiar celular" title="Copiar celular">
        {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
      </Button>
    </div>
  );
}

export function OficinaTable({ oficinas, onOpenLead }: { oficinas: Oficina[]; onOpenLead: (id: string) => void }) {
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
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02]">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead className="text-white/50">Oficina</TableHead>
            <TableHead className="text-white/50">Celular</TableHead>
            <TableHead className="text-white/50">Responsável</TableHead>
            <TableHead className="text-white/50">Status</TableHead>
            <TableHead className="text-right text-white/50">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {oficinas.map((oficina) => (
            <TableRow key={oficina.id} className="cursor-pointer border-white/5" onClick={() => onOpenLead(oficina.id)}>
              <TableCell className="font-medium text-white">{oficina.nome}</TableCell>
              <TableCell className="text-white/70">{oficina.whatsapp || "-"}</TableCell>
              <TableCell className="text-white/70">{oficina.responsavel || "-"}</TableCell>
              <TableCell>
                <StageBadge status={oficina.status} />
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1">
                  <Button type="button" variant="ghost" size="icon-sm" onClick={() => onOpenLead(oficina.id)} aria-label="Abrir gestão do lead" title="Abrir gestão">
                    <IdCard className="size-4" />
                  </Button>
                  <CopyCelularButton oficina={oficina} />
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
