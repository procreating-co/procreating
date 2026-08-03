import { Check, Circle, LoaderCircle } from "lucide-react";
import type { ProgressStep, ProgressStepState } from "@/lib/clients/workspace-registry";

const STATE_LABEL: Record<ProgressStepState, string> = {
  done: "Concluído",
  "in-progress": "Em andamento",
  pending: "Pendente",
};

const STATE_ICON: Record<ProgressStepState, typeof Check> = {
  done: Check,
  "in-progress": LoaderCircle,
  pending: Circle,
};

/** Checklist visual de progresso do projeto — 4 etapas fixas (estrutura, identidade, conteúdo, publicação). */
export function WorkspaceProgress({ steps, accent }: { steps: ProgressStep[]; accent: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-5">
      <p className="mb-4 font-mono text-xs uppercase tracking-wide text-muted-foreground">Progresso</p>
      <ul className="flex flex-col gap-3">
        {steps.map((step) => {
          const Icon = STATE_ICON[step.state];
          const isDone = step.state === "done";
          return (
            <li key={step.label} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Icon
                  className="size-4 shrink-0"
                  style={{ color: isDone ? accent : undefined }}
                  strokeWidth={isDone ? 2.5 : 2}
                />
                <span className="text-sm text-foreground">{step.label}</span>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                {STATE_LABEL[step.state]}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
