"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleOnboardingTaskAction } from "@/lib/clientes/actions";
import type { OnboardingTask } from "@/lib/supabase/types/database";
import { cn } from "@/lib/utils";

export function OnboardingTasksList({ clientId, tasks }: { clientId: string; tasks: OnboardingTask[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (tasks.length === 0) return <p className="text-sm text-muted-foreground">Nenhuma tarefa de onboarding.</p>;

  return (
    <ul className="flex flex-col gap-2">
      {tasks.map((task) => (
        <li key={task.id} className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={task.status === "done"}
            disabled={isPending}
            onChange={(e) => {
              const done = e.target.checked;
              startTransition(async () => {
                await toggleOnboardingTaskAction(task.id, clientId, done);
                router.refresh();
              });
            }}
            className="size-4 rounded border-input"
          />
          <span className={cn(task.status === "done" && "text-muted-foreground line-through")}>{task.title}</span>
        </li>
      ))}
    </ul>
  );
}
