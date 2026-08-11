"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { STAGE_OPTIONS } from "@/lib/prospeccao/stages";
import { ICP_OPTIONS } from "@/lib/prospeccao/icp";
import type { AderenciaIcp, Oficina, OficinaInput, OficinaStage } from "@/lib/prospeccao/types";

const EMPTY_INPUT: OficinaInput = {
  nome: "",
  cidade: "",
  responsavel: "",
  whatsapp: "",
  observacoes: "",
  status: "contato",
  aderenciaIcp: "nao_classificado",
};

export type OficinaFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Presente = editando essa oficina; ausente = criando uma nova. */
  oficina?: Oficina;
  onSubmit: (input: OficinaInput) => void;
  trigger?: ReactNode;
};

/** Dialog único reaproveitado por "Nova oficina" e "Editar" — mesmo padrão de `new-client-dialog.tsx`. */
export function OficinaFormDialog({ open, onOpenChange, oficina, onSubmit, trigger }: OficinaFormDialogProps) {
  const [input, setInput] = useState<OficinaInput>(EMPTY_INPUT);
  const isEditing = Boolean(oficina);

  useEffect(() => {
    if (!open) return;
    setInput(
      oficina
        ? {
            nome: oficina.nome,
            cidade: oficina.cidade,
            responsavel: oficina.responsavel,
            whatsapp: oficina.whatsapp,
            observacoes: oficina.observacoes,
            status: oficina.status,
            aderenciaIcp: oficina.aderenciaIcp,
          }
        : EMPTY_INPUT,
    );
  }, [open, oficina]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSubmit(input);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger}
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar oficina" : "Nova oficina"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Atualize os dados desta oficina." : "Cadastre uma oficina pra prospectar como parceira."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="oficina-nome">Nome da oficina</Label>
              <Input
                id="oficina-nome"
                value={input.nome}
                onChange={(e) => setInput((prev) => ({ ...prev, nome: e.target.value }))}
                placeholder="Auto Center Silva"
                autoFocus
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="oficina-cidade">Cidade</Label>
                <Input
                  id="oficina-cidade"
                  value={input.cidade}
                  onChange={(e) => setInput((prev) => ({ ...prev, cidade: e.target.value }))}
                  placeholder="Caxias do Sul, RS"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="oficina-responsavel">Responsável</Label>
                <Input
                  id="oficina-responsavel"
                  value={input.responsavel}
                  onChange={(e) => setInput((prev) => ({ ...prev, responsavel: e.target.value }))}
                  placeholder="Marcos Silva (opcional)"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="oficina-whatsapp">Celular</Label>
              <Input
                id="oficina-whatsapp"
                value={input.whatsapp}
                onChange={(e) => setInput((prev) => ({ ...prev, whatsapp: e.target.value }))}
                placeholder="55 54 99911-2233"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="oficina-status">Status</Label>
              <select
                id="oficina-status"
                value={input.status}
                onChange={(e) => setInput((prev) => ({ ...prev, status: e.target.value as OficinaStage }))}
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {STAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="oficina-icp">Aderência ICP</Label>
              <select
                id="oficina-icp"
                value={input.aderenciaIcp}
                onChange={(e) => setInput((prev) => ({ ...prev, aderenciaIcp: e.target.value as AderenciaIcp }))}
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {ICP_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="oficina-observacoes">Observações</Label>
              <textarea
                id="oficina-observacoes"
                value={input.observacoes}
                onChange={(e) => setInput((prev) => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Notas sobre o contato, histórico, próximos passos..."
                rows={3}
                className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[var(--client-accent)] text-black hover:opacity-90">
              {isEditing ? "Salvar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
