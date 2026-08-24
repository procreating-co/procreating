import { redirect } from "next/navigation";
import { getPortalSession, PORTAL_LOGIN_PATH } from "@/lib/portal/auth";
import { getPortalOverview, getPortalProductionItems } from "@/lib/portal/queries";
import { PortalOverviewCard } from "@/components/portal/overview/portal-overview-card";

/**
 * Overview (Fase B3) — resumo em uma tela: status do contrato (sem valor em R$, financeiro é
 * fase futura) + contagem de entregas em andamento/concluídas (deriva de `production_items`,
 * mesma fonte da aba Entregas — sem métrica inventada, ver `docs/client-portal-fase-b-plano.md`).
 */
export default async function PortalOverviewPage() {
  const session = await getPortalSession();
  if (!session) redirect(PORTAL_LOGIN_PATH);

  const [overview, itemsByKind] = await Promise.all([
    getPortalOverview(session.user.clientId),
    getPortalProductionItems(session.user.clientId),
  ]);

  const allItems = [...itemsByKind.producao, ...itemsByKind.entrega, ...itemsByKind.conteudo];

  return (
    <PortalOverviewCard
      clientName={session.user.clientName}
      contract={overview.activeContract}
      totalItems={allItems.length}
      concludedItems={allItems.filter((item) => item.status_tone === "neutral").length}
    />
  );
}
