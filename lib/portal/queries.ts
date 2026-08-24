import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Contract, ProductionItem, ProductionItemKind, ProductionProject } from "@/lib/supabase/types/database";

/**
 * Leituras do Portal — todas com `client_id` explícito além do filtro que a RLS
 * (`*_portal_select_own`, Fase A) já aplica sozinha. Defesa em profundidade: mesmo raciocínio já
 * documentado em `get_client_portal_profile()` (Fase A) e `is_portal_member_of()` — nunca confiar
 * só numa camada. `clientId` sempre vem de `getPortalSession()` (`lib/portal/auth`), nunca de
 * input do próprio cliente.
 *
 * Mesmo padrão de `lib/operacao/queries.ts`: join manual em TypeScript, sem embed do PostgREST.
 */

export type PortalOverview = {
  activeContract: Contract | null;
};

/** Overview (Fase B3) — só o contrato ATIVO mais recente, sem valor em R$ (financeiro é fase
 *  futura, fora do escopo do piloto — ver `docs/client-portal-fase-b-plano.md`). */
export async function getPortalOverview(clientId: string): Promise<PortalOverview> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contracts")
    .select("*")
    .eq("client_id", clientId)
    .eq("status", "ativo")
    .order("start_date", { ascending: false })
    .limit(1);

  return { activeContract: data?.[0] ?? null };
}

export type PortalProductionItemsByKind = Record<ProductionItemKind, ProductionItem[]>;

/** Entregas (Fase B4) — os 3 `kind` juntos (produção/entrega/conteúdo), cada um já vem separado
 *  pra tela agrupar por status sem precisar de 3 queries no componente. */
export async function getPortalProductionItems(clientId: string): Promise<PortalProductionItemsByKind> {
  const supabase = await createClient();
  const { data } = await supabase.from("production_items").select("*").eq("client_id", clientId).order("created_at", { ascending: false });

  const items = data ?? [];
  return {
    producao: items.filter((item) => item.kind === "producao"),
    entrega: items.filter((item) => item.kind === "entrega"),
    conteudo: items.filter((item) => item.kind === "conteudo"),
  };
}

export async function getPortalProductionProjects(clientId: string): Promise<ProductionProject[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("production_projects").select("*").eq("client_id", clientId).order("created_at", { ascending: false });
  return data ?? [];
}
