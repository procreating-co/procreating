"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateTaskStatusAction } from "@/lib/tasks/actions";
import type { Task } from "@/lib/supabase/types/database";
import { cn } from "@/lib/utils";

/** Lê `public.tasks` filtradas por `context_type: "client_onboarding"` (ver
 *  `lib/clientes/queries.ts`) — não existe mais uma tabela `onboarding_tasks` própria. */
export function OnboardingTasksList({ tasks }: { tasks: Task[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (tasks.length === 0) return <p className="text-sm text-muted-foreground">Nenhuma tarefa de onboarding.</p>;

  return (
    <div className="flex flex-col gap-2">
      {/* Auditoria de estados de erro (hardening) — era "dispara e esquece", checkbox voltava
       *  sozinha no refresh sem explicar por quê se a Server Action falhasse. */}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <ul className="flex flex-col gap-2">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={task.status === "done"}
              disabled={isPending}
              onChange={(e) => {
                const done = e.target.checked;
                setError(null);
                startTransition(async () => {
                  const result = await updateTaskStatusAction(task.id, done ? "done" : "pending");
                  if (!result.ok) setError(result.error);
                  router.refresh();
                });
              }}
              className="size-4 rounded border-input"
            />
            <span className={cn(task.status === "done" && "text-muted-foreground line-through")}>{task.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
