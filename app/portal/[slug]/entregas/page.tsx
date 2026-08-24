import { redirect } from "next/navigation";
import { getPortalSession, PORTAL_LOGIN_PATH } from "@/lib/portal/auth";
import { getPortalProductionItems } from "@/lib/portal/queries";
import { PortalEntregasList } from "@/components/portal/entregas/portal-entregas-list";

/**
 * Entregas (Fase B4) — tela única agrupada por tipo (Produção/Entrega/Conteúdo), não 3 abas
 * espelhando `/operacao` (decisão do plano: "não um dashboard cheio de informações
 * irrelevantes"). 100% dado real de `production_items` — sem item cadastrado, mostra um estado
 * vazio honesto (ver gap B0 em `docs/client-portal-fase-b-plano.md`), nunca dado inventado.
 */
export default async function PortalEntregasPage() {
  const session = await getPortalSession();
  if (!session) redirect(PORTAL_LOGIN_PATH);

  const itemsByKind = await getPortalProductionItems(session.user.clientId);

  return <PortalEntregasList itemsByKind={itemsByKind} />;
}
