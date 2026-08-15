"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Copy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markLeadContactedAction } from "@/lib/comercial/actions";
import { waMeLink } from "@/lib/comercial/csv";
import type { ExecutionQueueItem } from "@/lib/comercial/sequences";
import { cn } from "@/lib/utils";

const CHANNEL_LABEL: Record<string, string> = { whatsapp: "WhatsApp", email: "E-mail", ligacao: "Ligação" };

/**
 * Fila de execução — "hoje, quem eu preciso abordar" (seção 12/14 do prompt: reduzir cliques ao
 * mínimo). Cada linha já mostra o script pronto; duas ações, nada mais: abrir WhatsApp com a
 * mensagem preenchida (revisar e enviar — nunca dispara sozinho, decisão desta sessão) ou copiar
 * o texto (pra e-mail/ligação, ou WhatsApp sem número válido), e "Marcar contatado" avança a
 * cadência sozinho (não precisa abrir o lead pra isso).
 */
export function ExecutionQueue({ items }: { items: ExecutionQueueItem[] }) {
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCopy(leadId: string, script: string) {
    navigator.clipboard.writeText(script).then(() => {
      setCopiedId(leadId);
      setTimeout(() => setCopiedId((current) => (current === leadId ? null : current)), 1500);
    });
  }

  function handleMarkContacted(leadId: string) {
    startTransition(async () => {
      await markLeadContactedAction(leadId);
      router.refresh();
    });
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma ação pendente hoje — todos os leads com cadência configurada estão em dia.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map(({ lead, action }) => (
        <li key={lead.id} className="flex flex-col gap-2 rounded-lg border border-border/60 bg-card/20 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium">{lead.company_name}</p>
              <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide", action.overdue ? "border-danger/25 text-danger" : "border-border/60 text-muted-foreground")}>
                {action.overdue ? "Atrasado" : "Hoje"}
              </span>
              <span className="shrink-0 text-[10px] text-muted-foreground">{CHANNEL_LABEL[action.step.channel]}</span>
            </div>
            <p className="truncate text-xs text-muted-foreground">{action.step.script}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {action.step.channel === "whatsapp" && lead.whatsapp ? (
              <Button asChild type="button" variant="outline" size="sm" className="h-8 gap-1.5">
                <a href={waMeLink(lead.whatsapp, action.step.script)} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-3.5" />
                  Abrir WhatsApp
                </a>
              </Button>
            ) : (
              <Button type="button" variant="outline" size="sm" onClick={() => handleCopy(lead.id, action.step.script)} className="h-8 gap-1.5">
                {copiedId === lead.id ? <CheckCircle2 className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
                {copiedId === lead.id ? "Copiado" : "Copiar"}
              </Button>
            )}
            <Button type="button" size="sm" onClick={() => handleMarkContacted(lead.id)} disabled={isPending} className="h-8">
              Marcar contatado
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
