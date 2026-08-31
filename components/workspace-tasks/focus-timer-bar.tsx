"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pause, Square, Timer as TimerIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { finishFocusSessionAction, type RunningFocusSession } from "@/lib/tasks/actions";

/**
 * Timer livre + Pomodoro (§15/§16/§17) — os dois modos da MESMA `focus_session`, nunca
 * propriedade da task. Sobrevive a refresh de verdade: `startedAt` vem do servidor
 * (`getRunningFocusSessionAction`, chamado no mount de `WorkspaceTasks`), o cronômetro daqui só
 * recalcula `elapsed = agora - startedAt` a cada segundo — nunca guarda o próprio tempo decorrido
 * como fonte de verdade, então um F5 no meio do timer não perde nada.
 *
 * "Pause" e "Encerrar" fecham a sessão corrente (ver comentário de `finishFocusSessionAction`) —
 * não existe um estado "pausado" no banco; cada trecho contínuo de foco vira uma linha.
 */
export function FocusTimerBar({ initialSession }: { initialSession: RunningFocusSession | null }) {
  const router = useRouter();
  const [session, setSession] = useState(initialSession);
  const [now, setNow] = useState(() => Date.now());
  const [isPending, startTransition] = useTransition();

  useEffect(() => setSession(initialSession), [initialSession]);

  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [session]);

  if (!session) return null;

  const elapsedSeconds = Math.max(0, Math.floor((now - new Date(session.startedAt).getTime()) / 1000));
  const plannedSeconds = session.plannedMinutes ? session.plannedMinutes * 60 : null;
  const remainingSeconds = plannedSeconds !== null ? plannedSeconds - elapsedSeconds : null;
  const isOverdue = remainingSeconds !== null && remainingSeconds <= 0;
  const displaySeconds = remainingSeconds !== null ? Math.abs(remainingSeconds) : elapsedSeconds;

  function formatClock(totalSeconds: number): string {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const parts = h > 0 ? [h, m, s] : [m, s];
    return parts.map((part) => String(part).padStart(2, "0")).join(":");
  }

  function finish(completed: boolean) {
    if (!session) return;
    startTransition(async () => {
      await finishFocusSessionAction(session.id, completed);
      setSession(null);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-brand/30 bg-brand/5 px-4 py-3">
      <div className="flex items-center gap-3">
        <TimerIcon className="size-4 text-brand" />
        <div className="flex flex-col">
          <span className="text-sm font-medium">{session.taskTitle}</span>
          <span className="text-xs text-muted-foreground">{session.mode === "pomodoro" ? "Pomodoro" : "Timer livre"}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`font-mono text-lg tabular-nums ${isOverdue ? "text-danger" : ""}`}>
          {isOverdue && "+"}
          {formatClock(displaySeconds)}
        </span>
        <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={() => finish(false)} className="gap-1.5">
          <Pause className="size-3.5" />
          Pausar
        </Button>
        <Button type="button" size="sm" disabled={isPending} onClick={() => finish(true)} className="gap-1.5">
          <Square className="size-3.5" />
          Concluir
        </Button>
      </div>
    </div>
  );
}
