import type { AdminPreview } from "@/lib/admin/previews/types";

const PREVIEW_TTL_DAYS = 14;

/** Mutação em memória do processo — some se o servidor reiniciar, mesmo espírito das outras mocks. */
export const mockPreviews: AdminPreview[] = [];

export function createMockPreview(projectId: string, createdBy: string): AdminPreview {
  const now = new Date();
  const preview: AdminPreview = {
    token: crypto.randomUUID(),
    projectId,
    createdBy,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + PREVIEW_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
  };
  mockPreviews.push(preview);
  return preview;
}

export function getMockPreviewsByProject(projectId: string): AdminPreview[] {
  return mockPreviews.filter((preview) => preview.projectId === projectId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getMockPreviewByToken(token: string): AdminPreview | null {
  return mockPreviews.find((preview) => preview.token === token) ?? null;
}

export function revokeMockPreview(token: string): void {
  const preview = mockPreviews.find((p) => p.token === token);
  if (preview) preview.status = "revoked";
}

/** `status === "active"` sozinho não basta — expiração é sempre calculada na leitura, nunca um job que reescreve o registro. */
export function isPreviewUsable(preview: AdminPreview): boolean {
  return preview.status === "active" && new Date(preview.expiresAt).getTime() > Date.now();
}
