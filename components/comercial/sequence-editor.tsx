"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Mail, MessageCircle, Phone, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { createSequenceStepAction, deleteSequenceStepAction } from "@/lib/comercial/actions";
import type { SequenceChannel, SequenceStep } from "@/lib/supabase/types/database";
import { cn } from "@/lib/utils";

const CHANNEL_ICON: Record<SequenceChannel, typeof MessageCircle> = { whatsapp: MessageCircle, email: Mail, ligacao: Phone };
const CHANNEL_LABEL: Record<SequenceChannel, string> = { whatsapp: "WhatsApp", email: "E-mail", ligacao: "Ligação" };

/**
 * Cadência da estratégia — timeline simples, não um formulário de configuração de sequência
 * (seção 11 do prompt: "não criar uma página gigante"). Cada linha já mostrado é um passo; a
 * linha de adicionar embaixo é sempre o próximo `day_offset` sugerido (max atual + 2), editável.
 * Sem modal/dialog — tudo inline, mesmo espírito do resto do Comercial.
 */
export function SequenceEditor({ strategyId, steps }: { strategyId: string; steps: SequenceStep[] }) {
  const router = useRouter();
  const [dayOffset, setDayOffset] = useState(String(steps.length > 0 ? Math.max(...steps.map((s) => s.day_offset)) + 2 : 0));
  const [channel, setChannel] = useState<SequenceChannel>("whatsapp");
  const [script, setScript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deletingStep, setDeletingStep] = useState<SequenceStep | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    setError(null);
    startTransition(async () => {
      const result = await createSequenceStepAction({ strategyId, dayOffset: Number(dayOffset) || 0, channel, script });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setScript("");
      router.refresh();
    });
  }

  // Gap fechado (achado na auditoria de estados de erro, registrado ali como fora daquele
  // escopo específico) — excluir um passo não tinha confirmação nenhuma, inconsistente com toda
  // outra exclusão do produto. Mesmo padrão de ConfirmDialog já usado em contacts-section.tsx/
  // costs-list.tsx: só fecha no sucesso, mostra o erro e mantém aberto na falha.
  function handleDelete() {
    if (!deletingStep) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteSequenceStepAction(deletingStep.id, strategyId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDeletingStep(null);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {steps.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum passo ainda — a fila de execução da Prospecção só sugere ação pra leads dessa estratégia depois que houver ao menos um.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {steps.map((step) => {
            const Icon = CHANNEL_ICON[step.channel];
            return (
              <li key={step.id} className="flex items-start gap-3 rounded-lg border border-border/60 bg-card/20 p-3">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-[10px] font-medium tabular-nums">D{step.day_offset}</span>
                <Icon className="mt-1 size-3.5 shrink-0 text-muted-foreground" />
                <p className="flex-1 text-sm">{step.script}</p>
                <button
                  type="button"
                  onClick={() => setDeletingStep(step)}
                  disabled={isPending}
                  aria-label="Remover passo"
                  className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border/60 p-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Dia</span>
          <Input type="number" min={0} value={dayOffset} onChange={(e) => setDayOffset(e.target.value)} className="h-8 w-16" />
        </div>
        <div className="flex gap-1">
          {(Object.keys(CHANNEL_LABEL) as SequenceChannel[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setChannel(c)}
              className={cn("rounded-md border px-2 py-1 text-xs transition-colors", channel === c ? "border-brand text-brand" : "border-border/60 text-muted-foreground hover:text-foreground")}
            >
              {CHANNEL_LABEL[c]}
            </button>
          ))}
        </div>
        <Input value={script} onChange={(e) => setScript(e.target.value)} placeholder="Script da mensagem..." className="h-8 flex-1" />
        <Button type="button" size="sm" onClick={handleAdd} disabled={isPending || !script.trim()} className="h-8 gap-1.5 shrink-0">
          <Plus className="size-3.5" />
          Adicionar
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <ConfirmDialog
        open={deletingStep !== null}
        onOpenChange={(open) => !open && setDeletingStep(null)}
        title="Remover passo?"
        description={deletingStep ? `"D${deletingStep.day_offset} · ${CHANNEL_LABEL[deletingStep.channel]}" some da cadência — não dá pra desfazer.` : undefined}
        confirmLabel="Remover"
        isPending={isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
