import { pascoalWorkspace } from "@/content/clients/pascoal/workspace";
import { elenitaWorkspace } from "@/content/clients/elenita/workspace";
import { clienteXWorkspace } from "@/content/clients/cliente-x/workspace";
import type { ClientWorkspaceConfig } from "@/lib/clients/workspace-types";

export type { ClientWorkspaceConfig, ClientTemplate, ClientWorkspaceStatus } from "@/lib/clients/workspace-types";

/**
 * Switchboard de Workspaces — mesmo padrão de `lib/clients/registry.ts` (o pipeline legado da
 * Pascoal): import estático por cliente, um objeto no meio. Cliente novo = uma pasta em
 * `content/clients/<slug>/workspace.ts` + uma linha aqui. `components/client-hub/**` e
 * `components/workspace/**` só conhecem este arquivo — nunca leem `content/` direto.
 */
const WORKSPACE_REGISTRY: Record<string, ClientWorkspaceConfig> = {
  pascoal: pascoalWorkspace,
  elenita: elenitaWorkspace,
  "cliente-x": clienteXWorkspace,
};

export function getClientWorkspace(slug: string): ClientWorkspaceConfig | null {
  return WORKSPACE_REGISTRY[slug] ?? null;
}

export function getAllClientWorkspaces(): ClientWorkspaceConfig[] {
  return Object.values(WORKSPACE_REGISTRY);
}
