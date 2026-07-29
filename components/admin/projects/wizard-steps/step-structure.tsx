import type { AdminTemplate } from "@/lib/admin/templates/types";
import type { WizardData } from "@/lib/admin/projects/wizard-types";
import { segmentedButtonClass } from "@/components/admin/projects/wizard-steps/shared";

export function StepStructure({
  data,
  update,
  templates,
}: {
  data: WizardData;
  update: (patch: Partial<WizardData>) => void;
  templates: AdminTemplate[];
}) {
  const template = templates.find((t) => t.id === data.templateId);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <button type="button" className={segmentedButtonClass(data.structureMode === "default")} onClick={() => update({ structureMode: "default" })}>
          Padrão
        </button>
        <button type="button" className={segmentedButtonClass(data.structureMode === "custom")} onClick={() => update({ structureMode: "custom" })}>
          Personalizado
        </button>
      </div>

      {data.structureMode === "default" ? (
        <div className="rounded-md border border-border/60 p-4">
          <p className="mb-3 text-sm text-muted-foreground">
            Blocos gerados automaticamente pelo template &quot;{template?.name ?? "—"}&quot;, nesta ordem:
          </p>
          <ol className="flex flex-wrap gap-2">
            {(template?.blocks ?? []).map((block, index) => (
              <li key={block} className="rounded-full border border-border/60 px-3 py-1 font-mono text-xs">
                {index + 1}. {block}
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-border/60 px-6 py-10 text-center text-sm text-muted-foreground">
          Editor visual de estrutura personalizada — planejado pra FASE 7 do roadmap (ver docs/project-creation.md), ainda não
          implementado.
        </div>
      )}
    </div>
  );
}
