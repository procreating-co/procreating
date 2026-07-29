"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/admin/auth";
import { getMockProjectById } from "@/lib/admin/projects/mock-data";
import { createMockPreview, revokeMockPreview } from "@/lib/admin/previews/mock-data";

export async function generatePreviewAction(projectId: string): Promise<void> {
  const project = getMockProjectById(projectId);
  if (!project) return;

  const session = await getSession();
  createMockPreview(projectId, session?.user.name ?? "Equipe Procreating");
  revalidatePath(`/admin/projetos/${projectId}`);
}

export async function revokePreviewAction(token: string, projectId: string): Promise<void> {
  revokeMockPreview(token);
  revalidatePath(`/admin/projetos/${projectId}`);
}
