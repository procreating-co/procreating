import type { Metadata } from "next";
import { getLinksIndex } from "@/lib/links/registry";
import { LinksExplorer } from "@/components/links/links-explorer";

export const metadata: Metadata = {
  title: "Links | Procreating",
  robots: { index: false, follow: false },
};

/**
 * `/links` — centralizador interno de todo link/página/proposta/apresentação real do projeto
 * (pedido explícito). Fica dentro de `(internal)` de propósito: herda o gate de sessão + a
 * sidebar/header/tema do resto do ERP de graça (mesmo `getSession()`/`DashboardLayout` que
 * `/workspace`, `/financeiro` etc. já usam) — "deve parecer uma ferramenta interna da Procreating"
 * é literalmente o layout que toda outra página interna já usa, não um novo.
 *
 * Todo o conteúdo vem de `getLinksIndex()` — nada digitado à mão aqui.
 */
export default async function LinksPage() {
  const groups = await getLinksIndex();
  return <LinksExplorer groups={groups} />;
}
