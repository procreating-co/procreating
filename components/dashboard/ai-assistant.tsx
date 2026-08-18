"use client";

import { useState, useTransition } from "react";
import { Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { askAssistantAction } from "@/lib/ai/orchestrator";

const TOOL_LABEL: Record<string, string> = {
  get_pipeline_summary: "Pipeline",
  get_stale_leads: "Leads sem follow-up",
  get_my_tasks_due: "Suas tarefas",
  get_financial_summary: "Financeiro",
  get_overdue_accounts: "Contas atrasadas",
  get_upcoming_receivables: "A receber",
  get_goal_progress: "Meta mensal",
  get_top_client: "Maior cliente",
  get_growth_target: "Calculadora de meta",
};

/**
 * Botão discreto (ícone só, mesmo padrão de `CommandPalette`) — NÃO um chat full-screen. Uma
 * pergunta por vez, sem histórico persistido entre perguntas (decisão explícita desta primeira
 * fatia, §73-74): abrir o dialog sempre começa do zero. A resposta cita quais ferramentas foram
 * consultadas (chips pequenos) — transparência de onde o número veio, não é o modelo inventando.
 * Cérebro local-first (`lib/ai/orchestrator.ts`): a maioria das perguntas nunca toca a Anthropic
 * — o chip "Sem IA paga" aparece quando a resposta veio 100% do Intent Engine determinístico.
 */
export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [toolsUsed, setToolsUsed] = useState<string[]>([]);
  const [local, setLocal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function reset() {
    setQuestion("");
    setAnswer(null);
    setToolsUsed([]);
    setLocal(false);
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || isPending) return;
    setError(null);
    setAnswer(null);
    startTransition(async () => {
      const result = await askAssistantAction(question);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setAnswer(result.answer);
      setToolsUsed(result.toolsUsed);
      setLocal(result.local);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Assistente (IA)"
        title="Assistente (IA)"
        className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
      >
        <Sparkles className="size-4" />
      </button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) reset();
        }}
      >
        <DialogContent className="max-w-lg gap-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-ai" />
              Assistente
            </DialogTitle>
            <DialogDescription>Pergunte sobre pipeline, tarefas, meta ou financeiro — a resposta usa só dado real do sistema, e a maioria não depende de IA paga.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Quantos leads estão sem follow-up?"
              autoFocus
              disabled={isPending}
              className="flex-1"
            />
            <Button type="submit" disabled={isPending || !question.trim()}>
              {isPending ? "..." : "Perguntar"}
            </Button>
          </form>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          {answer && (
            <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-4">
              <p className="text-sm leading-relaxed whitespace-pre-line">{answer}</p>
              {(toolsUsed.length > 0 || local) && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {/* `local` = respondido pelo Intent Engine, sem passar pela Anthropic — pedido
                   *  explícito de transparência (item 1: zero custo pras funções principais). */}
                  {local && (
                    <span className="flex items-center gap-1 rounded-full border border-success/25 bg-success-subtle px-2 py-0.5 text-[11px] text-success">
                      <Zap className="size-2.5" />
                      Sem IA paga
                    </span>
                  )}
                  {toolsUsed.length > 0 && <span className="text-[11px] text-muted-foreground">Consultado:</span>}
                  {[...new Set(toolsUsed)].map((tool) => (
                    <span key={tool} className="rounded-full border border-border/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                      {TOOL_LABEL[tool] ?? tool}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
