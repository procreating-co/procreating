import type { AdminTemplate } from "@/lib/admin/templates/types";
import type { WizardData } from "@/lib/admin/projects/wizard-types";
import { radioCardClass } from "@/components/admin/projects/wizard-steps/shared";

export function StepTemplate({
  data,
  update,
  templates,
}: {
  data: WizardData;
  update: (patch: Partial<WizardData>) => void;
  templates: AdminTemplate[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {templates.map((template) => (
        <label key={template.id} className={radioCardClass(data.templateId === template.id)}>
          <input type="radio" name="templateId" className="sr-only" checked={data.templateId === template.id} onChange={() => update({ templateId: template.id })} />
          <span className="font-medium">{template.name}</span>
          <span className="text-xs text-muted-foreground">{template.description}</span>
          <span className="mt-1 flex flex-wrap gap-1">
            {template.blocks.map((block) => (
              <span key={block} className="rounded border border-border/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                {block}
              </span>
            ))}
          </span>
        </label>
      ))}
    </div>
  );
}
