import { PROJECT_WIZARD_STEPS } from "@/lib/admin/projects/wizard";
import { cn } from "@/lib/utils";

/**
 * Só o indicador visual dos 9 passos — sem estado, sem navegação entre eles. O primeiro passo
 * aparece "ativo" só pra ilustrar o visual; o wizard funcional (formulário de cada passo,
 * avançar/voltar, submit) é trabalho de uma etapa futura.
 */
export function WizardStepper() {
  return (
    <ol className="flex flex-wrap gap-2">
      {PROJECT_WIZARD_STEPS.map((step, index) => (
        <li
          key={step.key}
          className={cn(
            "flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-xs",
            index === 0 ? "border-foreground/20 bg-foreground/10 text-foreground" : "border-border/60 text-muted-foreground",
          )}
        >
          <span className="tabular-nums">{index + 1}</span>
          {step.label}
        </li>
      ))}
    </ol>
  );
}
