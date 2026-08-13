import { ClientsResolver } from "@/lib/erp/clients/resolver";
import { supabaseSource } from "@/lib/erp/clients/sources/supabase-source";
import type { InternalClient } from "@/lib/erp/clients/types";

export type { InternalClient } from "@/lib/erp/clients/types";

/**
 * Único ponto de resolução de cliente pro lado interno do ERP — Fase 1 (Foundation). Nenhuma
 * página consome isto ainda (Fase 1 não constrói tela nova pra isso, só a fundação); fica pronto
 * pra Fase 2 (Comercial/CRM) e Fase 7 (Operação, migrando `lib/dashboard/demo-data.ts` pra dado
 * real) ligarem.
 */
const resolver = new ClientsResolver([supabaseSource]);

export function listClients(): Promise<InternalClient[]> {
  return resolver.listClients();
}

export function getClientBySlug(slug: string): Promise<InternalClient | null> {
  return resolver.getClientBySlug(slug);
}
