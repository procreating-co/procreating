"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/admin/auth";
import { getMockProjectById, publishMockProject } from "@/lib/admin/projects/mock-data";
import { createMockDeployment } from "@/lib/admin/deployments/mock-data";

/**
 * Etapa 7 (Publicação, mock) — cria um `AdminDeployment` (mock, target=production, sempre
 * "succeeded" — sem pipeline assíncrono real) e marca o projeto como `published`. Nada disto é
 * Cloudflare/Vercel/deploy de verdade; é a mutação em memória que a Etapa 5 (Upload) e a Etapa 6
 * (Preview) já usam.
 */
export async function publishProjectAction(projectId: string): Promise<void> {
  const project = getMockProjectById(projectId);
  if (!project) return;

  const session = await getSession();
  createMockDeployment(projectId, session?.user.name ?? "Equipe Procreating");
  publishMockProject(projectId);

  revalidatePath(`/admin/projetos/${projectId}`);
  revalidatePath("/admin/projetos");
  revalidatePath("/admin/dashboard");
}
