"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { detectColumnMapping, parseCsv, rowsToLeads } from "@/lib/comercial/csv";
import { checkDuplicateLeadsAction, importListAction } from "@/lib/comercial/actions";
import type { DedupCheckResult } from "@/lib/comercial/types";
import type { Strategy } from "@/lib/supabase/types/database";
import { cn } from "@/lib/utils";

/**
 * Motor de Listas — fluxo em 2 telas, nunca um formulário: (1) soltar/escolher o CSV, mapeamento
 * de coluna automático, sem tela de "configurar mapeamento" (seção 5: "não criar um formulário
 * enorme"); (2) resumo de deduplicação (novo/existente/duplicado na própria planilha) + nome da
 * lista + estratégia opcional, um botão "Importar N novos". Duplicados nunca entram — não existe
 * um caminho de "importar mesmo assim" (seção 6: "não criar leads duplicados").
 */
export function ListImportDrawer({ open, onOpenChange, strategies }: { open: boolean; onOpenChange: (open: boolean) => void; strategies: Strategy[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dedup, setDedup] = useState<DedupCheckResult | null>(null);
  const [listName, setListName] = useState("");
  const [strategyId, setStrategyId] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function reset() {
    setFileName(null);
    setDedup(null);
    setListName("");
    setStrategyId("");
    setError(null);
  }

  function handleFile(file: File) {
    setError(null);
    const suggestedName = file.name.replace(/\.csv$/i, "").replace(/[_-]/g, " ");
    file.text().then((text) => {
      const { headers, rows } = parseCsv(text);
      if (headers.length === 0 || rows.length === 0) {
        setError("Não consegui ler linhas nesse arquivo — confira se é um CSV válido.");
        return;
      }
      const mapping = detectColumnMapping(headers);
      if (mapping.companyName == null) {
        setError('Não encontrei uma coluna de empresa ("Empresa"/"Nome") — renomeie a coluna e tente de novo.');
        return;
      }
      const leads = rowsToLeads(rows, mapping);
      setFileName(file.name);
      setListName(suggestedName);
      startTransition(async () => {
        const result = await checkDuplicateLeadsAction(leads);
        setDedup(result);
      });
    });
  }

  function handleConfirm() {
    if (!dedup) return;
    setError(null);
    const newRows = dedup.rows.filter((r) => r.status === "novo").map((r) => r.row);
    startTransition(async () => {
      const result = await importListAction({ listName, strategyId: strategyId || null, rows: newRows });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      reset();
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto bg-popover p-6 text-popover-foreground sm:max-w-md">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <SheetTitle>Importar lista</SheetTitle>
            <SheetDescription>CSV com colunas de empresa, contato, WhatsApp, e-mail — o resto o sistema reconhece sozinho.</SheetDescription>
          </div>

          {!dedup ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFile(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-16 text-center transition-colors",
                dragOver ? "border-brand bg-brand/5" : "border-border/60 hover:border-border"
              )}
            >
              <Upload className="size-6 text-muted-foreground" />
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">Solte o CSV aqui</p>
                <p className="text-xs text-muted-foreground">ou clique pra escolher o arquivo</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
              {isPending && <p className="text-xs text-muted-foreground">Lendo {fileName}...</p>}
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="list-name">Nome da lista</Label>
                <Input id="list-name" value={listName} onChange={(e) => setListName(e.target.value)} placeholder="Dentistas — Porto Alegre" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="list-strategy">Estratégia (opcional)</Label>
                <select
                  id="list-strategy"
                  value={strategyId}
                  onChange={(e) => setStrategyId(e.target.value)}
                  className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <option value="">Sem estratégia de origem</option>
                  {strategies.map((strategy) => (
                    <option key={strategy.id} value={strategy.id}>
                      {strategy.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2 rounded-lg border border-border/60 p-4">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="size-4" />
                  <span className="text-sm font-medium">{dedup.newCount} novos</span>
                </div>
                {dedup.existingCount > 0 && <p className="text-xs text-muted-foreground">{dedup.existingCount} já existem na base — ignorados automaticamente.</p>}
                {dedup.duplicateInListCount > 0 && <p className="text-xs text-muted-foreground">{dedup.duplicateInListCount} duplicados dentro da própria planilha — ignorados automaticamente.</p>}
              </div>

              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={reset} className="flex-1">
                  Cancelar
                </Button>
                <Button type="button" onClick={handleConfirm} disabled={isPending || dedup.newCount === 0 || !listName.trim()} className="flex-1">
                  {isPending ? "Importando..." : `Importar ${dedup.newCount} novos`}
                </Button>
              </div>
            </div>
          )}

          {error && !dedup && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
