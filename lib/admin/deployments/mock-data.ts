import type { AdminDeployment } from "@/lib/admin/deployments/types";

/** Mutação em memória do processo — some se o servidor reiniciar, mesmo espírito das outras mocks. */
export const mockDeployments: AdminDeployment[] = [];

export function createMockDeployment(projectId: string, triggeredBy: string): AdminDeployment {
  const now = new Date().toISOString();
  const deployment: AdminDeployment = {
    id: crypto.randomUUID(),
    projectId,
    target: "production",
    status: "succeeded",
    triggeredBy,
    startedAt: now,
    finishedAt: now,
  };
  mockDeployments.push(deployment);
  return deployment;
}

/** Mais recente primeiro — histórico de deploys de um projeto, usado em `/admin/projetos/[id]`. */
export function getMockDeploymentsByProject(projectId: string): AdminDeployment[] {
  return mockDeployments.filter((deployment) => deployment.projectId === projectId).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}
