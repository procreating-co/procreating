import { CAPABILITY_CATALOG } from "@/lib/platform/capabilities";
import type { CapabilityKey } from "@/lib/supabase/types/database";
import type { WizardData } from "@/lib/admin/projects/wizard-types";

export function StepCapabilities({
  data,
  update,
}: {
  data: WizardData;
  update: (patch: Partial<WizardData>) => void;
}) {
  function toggle(key: CapabilityKey) {
    update({ capabilities: { ...data.capabilities, [key]: !data.capabilities[key] } });
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {CAPABILITY_CATALOG.map((capability) => (
        <label
          key={capability.key}
          className="flex cursor-pointer items-start gap-3 rounded-md border border-border/60 px-4 py-3 text-sm transition-colors hover:bg-foreground/5"
        >
          <input
            type="checkbox"
            checked={data.capabilities[capability.key]}
            onChange={() => toggle(capability.key)}
            className="mt-0.5 size-4 accent-foreground"
          />
          <span>
            <span className="block font-medium">{capability.label}</span>
            <span className="block text-xs text-muted-foreground">{capability.description}</span>
          </span>
        </label>
      ))}
    </div>
  );
}
