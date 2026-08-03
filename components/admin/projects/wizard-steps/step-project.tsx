import type { WizardData } from "@/lib/admin/projects/wizard-types";
import { slugify } from "@/lib/admin/format";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function StepProject({
  data,
  update,
  existingSlugs,
}: {
  data: WizardData;
  update: (patch: Partial<WizardData>) => void;
  existingSlugs: string[];
}) {
  const slugTaken = data.slug.length > 0 && existingSlugs.includes(data.slug);

  function handleNameChange(value: string) {
    update(data.slugTouched ? { projectName: value } : { projectName: value, slug: slugify(value) });
  }

  return (
    <div className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="projectName">Nome do projeto</Label>
        <Input id="projectName" value={data.projectName} onChange={(e) => handleNameChange(e.target.value)} placeholder="Ex.: Posicionamento 2026" autoFocus />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="slug">Slug (URL pública)</Label>
        <Input id="slug" value={data.slug} onChange={(e) => update({ slug: slugify(e.target.value), slugTouched: true })} aria-invalid={slugTaken} />
        <p className="text-xs text-muted-foreground">/clients/{data.slug || "..."}</p>
        {slugTaken && <p className="text-xs text-destructive">Esse slug já está em uso por outro projeto.</p>}
      </div>
    </div>
  );
}
