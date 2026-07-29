"use server";

import { createMockClient, getMockClientById } from "@/lib/admin/clients/mock-data";
import { createMockProject } from "@/lib/admin/projects/mock-data";
import { getMockTemplateById } from "@/lib/admin/templates/mock-data";

export type CreateProjectInput = {
  clientMode: "existing" | "new";
  clientId: string | null;
  newClientName: string;
  projectName: string;
  templateId: string | null;
};

export type CreateProjectResult = { ok: true; projectId: string } | { ok: false; error: string };

/**
 * Conclusão do Wizard (passo "Review" → confirmar). Mock — mutação em memória via
 * `createMockClient`/`createMockProject`, nada gravado em banco real (Supabase/R2 ainda não
 * conectados, ver `docs/project-creation.md`). Revalida server-side o que o client já validou,
 * porque Server Actions são uma superfície pública — nunca confiar só na validação do form.
 */
export async function createProjectAction(input: CreateProjectInput): Promise<CreateProjectResult> {
  const projectName = input.projectName.trim();
  if (!projectName) return { ok: false, error: "Nome do projeto é obrigatório." };

  if (!input.templateId || !getMockTemplateById(input.templateId)) {
    return { ok: false, error: "Selecione um template válido." };
  }

  let clientId: string;
  if (input.clientMode === "new") {
    const newClientName = input.newClientName.trim();
    if (!newClientName) return { ok: false, error: "Nome do novo cliente é obrigatório." };
    clientId = createMockClient(newClientName).id;
  } else {
    if (!input.clientId || !getMockClientById(input.clientId)) {
      return { ok: false, error: "Selecione um cliente válido." };
    }
    clientId = input.clientId;
  }

  const project = createMockProject({ name: projectName, clientId, templateId: input.templateId });
  return { ok: true, projectId: project.id };
}
