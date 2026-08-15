"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { updateClientInfoAction } from "@/lib/clientes/actions";
import type { Client } from "@/lib/supabase/types/database";

/** Editar cadastro básico do cliente (nome/documento/segmento/cidade/UF) — antes só o status
 *  (`ClientStatusSelect`) era editável na ficha; "não é possível editar clientes" era literal. */
export function ClientInfoDialog({ client }: { client: Client }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(client.name);
  const [document, setDocument] = useState(client.document ?? "");
  const [segment, setSegment] = useState(client.segment ?? "");
  const [city, setCity] = useState(client.city ?? "");
  const [state, setState] = useState(client.state ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function reset() {
    setName(client.name);
    setDocument(client.document ?? "");
    setSegment(client.segment ?? "");
    setCity(client.city ?? "");
    setState(client.state ?? "");
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateClientInfoAction(client.id, { name, document: document || null, segment: segment || null, city: city || null, state: state || null });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        setOpen(next);
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-1.5">
          <Pencil className="size-3.5" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md gap-5">
        <DialogHeader>
          <DialogTitle>Editar cliente</DialogTitle>
          <DialogDescription>Cadastro básico — nome, documento, segmento e localização.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="client-name">Nome</Label>
            <Input id="client-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="client-document">CNPJ/CPF</Label>
            <Input id="client-document" value={document} onChange={(e) => setDocument(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="client-segment">Segmento</Label>
            <Input id="client-segment" value={segment} onChange={(e) => setSegment(e.target.value)} />
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="client-city">Cidade</Label>
              <Input id="client-city" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="client-state">UF</Label>
              <Input id="client-state" maxLength={2} value={state} onChange={(e) => setState(e.target.value.toUpperCase())} className="w-16" />
            </div>
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
