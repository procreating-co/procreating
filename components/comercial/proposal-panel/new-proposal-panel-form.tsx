"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProposalFromTemplateAction } from "@/lib/comercial/proposal-actions";
import type { ProposalTemplate } from "@/lib/supabase/types/database";

/**
 * Form de criação do painel `/propostas` — a única info obrigatória é o nome da cliente (vira
 * `brand_name` + base do slug automático); o resto (as 7 seções) é preenchido depois no editor
 * completo (`/comercial/propostas/[id]`), pra onde este form redireciona ao criar. Sem
 * `leadId`/`clientId` — proposta avulsa, fora do fluxo de Lead (`createProposalFromTemplateAction`
 * já aceita os dois `null`).
 */
export function NewProposalPanelForm({ template }: { template: ProposalTemplate }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate() {
    if (!name.trim()) {
      setError("Diga o nome da cliente.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createProposalFromTemplateAction({
        leadId: null,
        clientId: null,
        templateId: template.id,
        title: `Proposta — ${name.trim()}`,
        ownerName: name.trim(),
        brandName: name.trim(),
      });
      if (!result.ok || !result.proposalId) {
        setError(result.ok ? "Não foi possível criar." : result.error);
        return;
      }
      router.push(`/comercial/propostas/${result.proposalId}`);
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="panel-client-name">Nome da cliente</Label>
        <Input
          id="panel-client-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="Ex.: Maria Souza"
          autoFocus
        />
        <p className="text-xs text-muted-foreground">
          Cria a proposta a partir de &ldquo;{template.title}&rdquo; e leva direto pro editor — o link público (
          <span className="font-mono">/propostas/{"{slug}"}</span>) só fica ativo depois de enviar.
        </p>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="button" onClick={handleCreate} disabled={isPending} className="w-fit">
        {isPending ? "Criando..." : "Criar proposta"}
      </Button>
    </div>
  );
}
