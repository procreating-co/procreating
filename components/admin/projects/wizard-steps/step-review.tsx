import type { AdminClient } from "@/lib/admin/clients/types";
import type { AdminTemplate } from "@/lib/admin/templates/types";
import type { WizardData } from "@/lib/admin/projects/wizard-types";
import { CAPABILITY_CATALOG } from "@/lib/platform/capabilities";

export function StepReview({
  data,
  clients,
  templates,
}: {
  data: WizardData;
  clients: AdminClient[];
  templates: AdminTemplate[];
}) {
  const clientName = data.clientMode === "new" ? `${data.newClientName} (novo cliente)` : (clients.find((c) => c.id === data.clientId)?.name ?? "—");
  const template = templates.find((t) => t.id === data.templateId);
  const enabledCapabilities = CAPABILITY_CATALOG.filter((capability) => data.capabilities[capability.key]);
  const assetCount =
    (data.assets.hero ? 1 : 0) +
    (data.assets.logo ? 1 : 0) +
    data.assets.videosSocial.length +
    (data.assets.videoAcquisition ? 1 : 0) +
    data.assets.galleryFolders.reduce((total, folder) => total + folder.files.length, 0);

  return (
    <div className="flex flex-col gap-5">
      <ReviewRow label="Cliente" value={clientName} />
      <ReviewRow label="Projeto" value={`${data.projectName || "—"}  (/p/${data.slug || "..."})`} />
      <ReviewRow label="Template" value={template?.name ?? "—"} />
      <ReviewRow label="Capabilities" value={enabledCapabilities.length ? enabledCapabilities.map((c) => c.label).join(", ") : "Nenhuma"} />
      <ReviewRow label="Estrutura" value={data.structureMode === "default" ? "Padrão (blocos do template)" : "Personalizado"} />
      <ReviewRow label="Assets" value={`${assetCount} arquivo(s) selecionado(s)`} />
      <p className="text-sm text-muted-foreground">
        Ao confirmar, o projeto passa por Draft → Preview → Deploy → Publicado — simulado nesta fase (sem Supabase/R2 reais
        ainda, ver docs/project-creation.md).
      </p>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border/40 pb-3">
      <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}
