"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, Timer as TimerIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startFocusSessionAction, stopFocusSessionAction } from "@/lib/gamification/actions";
import type { Task, WorkSession } from "@/lib/supabase/types/database";

function formatElapsed(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * Timer de foco — iniciar/parar, persistido em `work_sessions` (sobrevive a um refresh: a página
 * consulta `getActiveSession` no server e passa como `initialSession`). Sessão >= 10min ao parar
 * concede XP (RPC `stop_focus_session`) — mostrado como "+5 XP" efêmero, mesmo padrão do checkbox
 * de tarefa em `my-day-tasks.tsx`.
 */
export function FocusTimer({ initialSession, tasks }: { initialSession: WorkSession | null; tasks: Task[] }) {
  const router = useRouter();
  const [session, setSession] = useState(initialSession);
  const [taskId, setTaskId] = useState<string>(initialSession?.task_id ?? "");
  const [elapsed, setElapsed] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    const startedAtMs = new Date(session.started_at).getTime();
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - startedAtMs) / 1000)));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [session]);

  function handleStart() {
    setError(null);
    startTransition(async () => {
      const result = await startFocusSessionAction(taskId || null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSession({
        id: result.sessionId,
        user_id: "",
        task_id: taskId || null,
        started_at: new Date().toISOString(),
        ended_at: null,
        duration_seconds: null,
        created_at: new Date().toISOString(),
      });
    });
  }

  function handleStop() {
    if (!session) return;
    setError(null);
    const sessionId = session.id;
    startTransition(async () => {
      const result = await stopFocusSessionAction(sessionId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSession(null);
      setElapsed(0);
      if (result.result.xpAwarded) {
        setFeedback("+5 XP");
        setTimeout(() => setFeedback(null), 2500);
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <TimerIcon className="size-3.5" />
        Foco
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-2xl font-semibold tabular-nums">{formatElapsed(elapsed)}</span>
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {feedback && (
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-full bg-brand-subtle px-2 py-0.5 text-xs font-medium text-brand"
              >
                {feedback}
              </motion.span>
            )}
          </AnimatePresence>
          {session ? (
            <Button type="button" size="sm" variant="outline" onClick={handleStop} disabled={isPending} className="gap-1.5">
              <Pause className="size-3.5" />
              Parar
            </Button>
          ) : (
            <Button type="button" size="sm" onClick={handleStart} disabled={isPending} className="gap-1.5">
              <Play className="size-3.5" />
              Iniciar
            </Button>
          )}
        </div>
      </div>
      {!session && tasks.length > 0 && (
        <select
          value={taskId}
          onChange={(e) => setTaskId(e.target.value)}
          className="h-8 rounded-md border border-input bg-transparent px-2.5 text-xs text-muted-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <option value="">Sem tarefa vinculada</option>
          {tasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.title}
            </option>
          ))}
        </select>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
