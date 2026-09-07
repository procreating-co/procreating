"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronDown, Handshake, Play, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { FocusTimerBar } from "@/components/workspace-tasks/focus-timer-bar";
import { StartFocusDialog } from "@/components/workspace-tasks/start-focus-dialog";
import { DayTimeline } from "@/components/workspace-tasks/day-timeline";
import type { RunningFocusSession } from "@/lib/tasks/actions";
import type { TimeBlockWithTask } from "@/lib/tasks/time-block-actions";
import type { Task } from "@/lib/supabase/types/database";
import type { StaleLead, TodayProgress } from "@/lib/workspace/queries";
import { cn } from "@/lib/utils";

/**
 * "Foco de hoje" — painel lateral (pedido explícito, redesign "clareza operacional"): timer/
 * pomodoro (`FocusTimerBar`, movido pra cá — antes ficava solto no topo da coluna principal),
 * próxima tarefa recomendada (`lib/workspace/queries.ts#pickRecommendedTask`) com CTA "Começar
 * foco", progresso do dia, agenda (`DayTimeline`, também movida pra cá) e leads que precisam de
 * atenção. Recolhível (botão no cabeçalho) — "deve poder ser recolhido em telas menores", aberto
 * por padrão em qualquer tamanho de tela.
 */
export function FocusPanel({
  recommendedTask,
  todayProgress,
  todayTimeBlocks,
  clientNameById,
  staleLeads,
  runningSession,
}: {
  recommendedTask: Task | null;
  todayProgress: TodayProgress | null;
  todayTimeBlocks: TimeBlockWithTask[];
  clientNameById: Map<string, string>;
  staleLeads: StaleLead[];
  runningSession: RunningFocusSession | null;
}) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [startingFocus, setStartingFocus] = useState(false);

  const progressPct = todayProgress && todayProgress.total > 0 ? Math.round((todayProgress.done / todayProgress.total) * 100) : null;

  return (
    <aside className="flex h-fit flex-col gap-5 rounded-xl border border-border/60 bg-card/40 p-5 lg:sticky lg:top-6">
      <button type="button" onClick={() => setCollapsed((c) => !c)} className="flex items-center justify-between gap-2 text-left">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Foco de hoje</span>
        <ChevronDown className={cn("size-3.5 shrink-0 text-muted-foreground transition-transform", collapsed && "-rotate-90")} />
      </button>

      {!collapsed && (
        <div className="flex flex-col gap-5">
          {runningSession ? (
            <FocusTimerBar initialSession={runningSession} />
          ) : recommendedTask ? (
            <div className="flex flex-col gap-2.5 rounded-lg border border-brand-subtle-border bg-brand-subtle p-3.5">
              <span className="text-xs text-muted-foreground">Próxima tarefa recomendada</span>
              <span className="text-sm font-medium leading-snug">{recommendedTask.title}</span>
              <Button type="button" size="sm" className="w-fit gap-1.5" onClick={() => setStartingFocus(true)}>
                <Play className="size-3.5" />
                Começar foco
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma tarefa pendente pra hoje — nada pra focar agora.</p>
          )}

          {progressPct !== null && todayProgress && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progresso do dia</span>
                <span>
                  {todayProgress.done}/{todayProgress.total} · {progressPct}%
                </span>
              </div>
              <Progress value={progressPct} className="h-1.5" />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Próximos compromissos</span>
            <DayTimeline blocks={todayTimeBlocks} clientNameById={clientNameById} />
          </div>

          {staleLeads.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Precisam de atenção</span>
              <ul className="flex flex-col gap-1">
                {staleLeads.map((lead) => (
                  <li key={lead.id}>
                    <Link href="/comercial?tab=commercial" className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-foreground/[0.04]">
                      <Handshake className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate">{lead.companyName}</span>
                      <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!recommendedTask && !runningSession && todayTimeBlocks.length === 0 && staleLeads.length === 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="size-3.5" />
              Tudo em dia por aqui.
            </div>
          )}
        </div>
      )}

      {recommendedTask && (
        <StartFocusDialog
          taskId={recommendedTask.id}
          taskTitle={recommendedTask.title}
          mode="free"
          open={startingFocus}
          onOpenChange={setStartingFocus}
          onStarted={() => {
            setStartingFocus(false);
            router.refresh();
          }}
        />
      )}
    </aside>
  );
}
