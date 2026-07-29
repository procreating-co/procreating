import type { AdminClient } from "@/lib/admin/clients/types";
import type { WizardData } from "@/lib/admin/projects/wizard-types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { segmentedButtonClass, radioCardClass } from "@/components/admin/projects/wizard-steps/shared";

export function StepClient({
  data,
  update,
  clients,
}: {
  data: WizardData;
  update: (patch: Partial<WizardData>) => void;
  clients: AdminClient[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2">
        <button type="button" className={segmentedButtonClass(data.clientMode === "existing")} onClick={() => update({ clientMode: "existing" })}>
          Cliente existente
        </button>
        <button type="button" className={segmentedButtonClass(data.clientMode === "new")} onClick={() => update({ clientMode: "new" })}>
          Novo cliente
        </button>
      </div>

      {data.clientMode === "existing" ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {clients.map((client) => (
            <label key={client.id} className={radioCardClass(data.clientId === client.id)}>
              <input type="radio" name="clientId" className="sr-only" checked={data.clientId === client.id} onChange={() => update({ clientId: client.id })} />
              <span className="font-medium">{client.name}</span>
            </label>
          ))}
        </div>
      ) : (
        <div className="flex max-w-sm flex-col gap-2">
          <Label htmlFor="newClientName">Nome do cliente</Label>
          <Input
            id="newClientName"
            value={data.newClientName}
            onChange={(e) => update({ newClientName: e.target.value })}
            placeholder="Ex.: Pascoal Bombas"
            autoFocus
          />
        </div>
      )}
    </div>
  );
}
