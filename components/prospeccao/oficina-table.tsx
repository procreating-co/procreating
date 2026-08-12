"use client";

import { useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Check, Copy, IdCard, Instagram, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OficinaFormDialog } from "@/components/prospeccao/oficina-form-dialog";
import { StageBadge } from "@/components/prospeccao/stage-badge";
import { CityCell } from "@/components/prospeccao/city-cell";
import { useOficinas } from "@/components/prospeccao/oficinas-store";
import type { Oficina } from "@/lib/prospeccao/types";
import { cn } from "@/lib/utils";

export type OficinaSortKey = "nome" | "cidade" | "whatsapp" | "responsavel" | "instagram" | "status";
export type SortDir = "asc" | "desc";

const COPY_FEEDBACK_MS = 1600;

function InstagramCell({ url }: { url: string }) {
  if (!url) return <span className="text-white/30">-</span>;
  const handle = url.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/\/$/, "");
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1.5 text-white/70 transition-colors hover:text-[var(--client-accent)]"
    >
      <Instagram className="size-3.5 shrink-0" />
      <span className="truncate">@{handle}</span>
    </a>
  );
}

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

function SortableHead({
  sortKey,
  activeKey,
  dir,
  onSort,
  className,
  children,
}: {
  sortKey: OficinaSortKey;
  activeKey: OficinaSortKey;
  dir: SortDir;
  onSort: (key: OficinaSortKey) => void;
  className?: string;
  children: ReactNode;
}) {
  const active = sortKey === activeKey;
  return (
    <TableHead className={cn("p-0 text-white/50", className)}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "flex w-full items-center gap-1.5 px-4 py-3 text-left font-medium transition-colors hover:text-white",
          active && "text-white",
        )}
        aria-label={`Ordenar por ${children}${active ? (dir === "asc" ? ", crescente" : ", decrescente") : ""}`}
      >
        {children}
        {active ? dir === "asc" ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" /> : <ArrowUpDown className="size-3.5 text-white/20" />}
      </button>
    </TableHead>
  );
}

export type OficinaTableProps = {
  oficinas: Oficina[];
  onOpenLead: (id: string) => void;
  sortKey: OficinaSortKey;
  sortDir: SortDir;
  onSort: (key: OficinaSortKey) => void;
};

export function OficinaTable({ oficinas, onOpenLead, sortKey, sortDir, onSort }: OficinaTableProps) {
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

  const headProps = { activeKey: sortKey, dir: sortDir, onSort };

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02]">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            <SortableHead sortKey="nome" {...headProps}>
              Oficina
            </SortableHead>
            <SortableHead sortKey="cidade" {...headProps}>
              Cidade
            </SortableHead>
            <SortableHead sortKey="whatsapp" {...headProps}>
              Celular
            </SortableHead>
            <SortableHead sortKey="responsavel" {...headProps}>
              Responsável
            </SortableHead>
            <SortableHead sortKey="instagram" {...headProps}>
              Instagram
            </SortableHead>
            <SortableHead sortKey="status" {...headProps}>
              Status
            </SortableHead>
            <TableHead className="text-right text-white/50">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {oficinas.map((oficina) => (
            <TableRow key={oficina.id} className="cursor-pointer border-white/5" onClick={() => onOpenLead(oficina.id)}>
              <TableCell className="max-w-[280px] truncate font-medium text-white underline-offset-4 hover:underline" title={oficina.nome}>
                {oficina.nome}
              </TableCell>
              <TableCell>
                <CityCell cidade={oficina.cidade} bairro={oficina.bairro} endereco={oficina.endereco} />
              </TableCell>
              <TableCell className="text-white/70">{oficina.whatsapp || "-"}</TableCell>
              <TableCell className="text-white/70">{oficina.responsavel || "-"}</TableCell>
              <TableCell>
                <InstagramCell url={oficina.instagram} />
              </TableCell>
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
