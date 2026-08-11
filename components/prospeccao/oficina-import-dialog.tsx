"use client";

import { useMemo, useRef, useState } from "react";
import { AlertTriangle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useOficinas } from "@/components/prospeccao/oficinas-store";
import { parseOficinasCsv } from "@/lib/prospeccao/csv";
import type { ParsedOficinaRow } from "@/lib/prospeccao/types";

const PREVIEW_LIMIT = 8;

export function OficinaImportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { oficinas, importOficinas } = useOficinas();
  const [rows, setRows] = useState<ParsedOficinaRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importable = useMemo(() => rows.filter((r) => !r.invalid && !r.duplicate), [rows]);
  const duplicateCount = useMemo(() => rows.filter((r) => !r.invalid && r.duplicate).length, [rows]);
  const invalidCount = useMemo(() => rows.filter((r) => r.invalid).length, [rows]);

  function handleText(text: string) {
    setRows(text.trim() ? parseOficinasCsv(text, oficinas) : []);
  }

  async function handleFile(file: File) {
    setFileName(file.name);
    const text = await file.text();
    handleText(text);
  }

  function reset() {
    setRows([]);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleImport() {
    importOficinas(importable);
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar oficinas</DialogTitle>
          <DialogDescription>
            Suba um CSV com nome, celular e responsável (opcional). Mapeamos as colunas automaticamente pelo cabeçalho.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <label
            htmlFor="oficina-csv-input"
            className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-input px-6 py-8 text-center text-sm text-muted-foreground transition-colors hover:border-ring"
          >
            <Upload className="size-5" />
            {fileName ? <span className="text-foreground">{fileName}</span> : <span>Clique para selecionar um arquivo .csv</span>}
            <input
              ref={fileInputRef}
              id="oficina-csv-input"
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </label>

          {rows.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium text-foreground">
                  {rows.length} {rows.length === 1 ? "linha encontrada" : "linhas encontradas"}
                </span>
                {duplicateCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-400">
                    <AlertTriangle className="size-3" />
                    {duplicateCount} duplicada{duplicateCount === 1 ? "" : "s"}, será{duplicateCount === 1 ? "" : "ão"} ignorada{duplicateCount === 1 ? "" : "s"}
                  </span>
                )}
                {invalidCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-xs text-red-400">
                    <AlertTriangle className="size-3" />
                    {invalidCount} sem nome, será{invalidCount === 1 ? "" : "ão"} ignorada{invalidCount === 1 ? "" : "s"}
                  </span>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto rounded-lg border border-border/60">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-medium">Nome</th>
                      <th className="px-3 py-2 font-medium">Celular</th>
                      <th className="px-3 py-2 font-medium">Responsável</th>
                      <th className="px-3 py-2 font-medium">Situação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, PREVIEW_LIMIT).map((row, i) => (
                      <tr key={i} className="border-t border-border/60">
                        <td className="px-3 py-2">{row.nome || "-"}</td>
                        <td className="px-3 py-2">{row.whatsapp || "-"}</td>
                        <td className="px-3 py-2">{row.responsavel || "-"}</td>
                        <td className="px-3 py-2">
                          {row.invalid ? (
                            <span className="text-red-400">Sem nome</span>
                          ) : row.duplicate ? (
                            <span className="text-amber-400">Duplicada</span>
                          ) : (
                            <span className="text-emerald-400">Pronta pra importar</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.length > PREVIEW_LIMIT && (
                  <p className="border-t border-border/60 px-3 py-2 text-xs text-muted-foreground">
                    +{rows.length - PREVIEW_LIMIT} linha{rows.length - PREVIEW_LIMIT === 1 ? "" : "s"} não exibida{rows.length - PREVIEW_LIMIT === 1 ? "" : "s"} na prévia.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" disabled={importable.length === 0} onClick={handleImport} className="bg-[var(--client-accent)] text-black hover:opacity-90 disabled:opacity-40">
            Importar {importable.length} oficina{importable.length === 1 ? "" : "s"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
