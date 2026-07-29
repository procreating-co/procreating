import { Check } from "lucide-react";
import { PROJECT_WIZARD_STEPS } from "@/lib/admin/projects/wizard";
import { cn } from "@/lib/utils";

/**
 * Indicador visual dos 11 passos, dirigido pelo estado real do Wizard
 * (`components/admin/projects/project-wizard.tsx`) — passos antes do atual aparecem concluídos
 * (✓), o atual em destaque, os seguintes neutros. Clicável só pra passos já concluídos
 * (voltar); não dá pra pular pra frente sem passar pela validação de cada passo.
 */
export function WizardStepper({
  currentIndex,
  onStepClick,
}: {
  currentIndex: number;
  onStepClick?: (index: number) => void;
}) {
  return (
    <ol className="flex flex-wrap gap-2">
      {PROJECT_WIZARD_STEPS.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        const clickable = isDone && onStepClick;
        return (
          <li key={step.key}>
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onStepClick(index)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-xs transition-colors",
                isCurrent && "border-foreground/20 bg-foreground/10 text-foreground",
                isDone && "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
                !isCurrent && !isDone && "border-border/60 text-muted-foreground",
                clickable && "cursor-pointer hover:bg-emerald-500/20",
                !clickable && "cursor-default",
              )}
            >
              {isDone ? <Check className="size-3" /> : <span className="tabular-nums">{index + 1}</span>}
              {step.label}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
