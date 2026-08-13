import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ClientsProvider } from "@/lib/erp/clients/provider";
import type { InternalClient } from "@/lib/erp/clients/types";
import type { Client } from "@/lib/supabase/types/database";

function toInternalClient(row: Client): InternalClient {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status,
    document: row.document,
    segment: row.segment,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Única implementação real de `ClientsProvider` nesta fase — consulta `public.clients` via
 * `lib/supabase/server.ts`. Adaptador puro (sem fallback/merge — isso é responsabilidade do
 * `ClientsResolver`), mesmo padrão de `lib/clients/sources/registry-source.ts`.
 */
export const supabaseSource: ClientsProvider = {
  async listClients(): Promise<InternalClient[]> {
    const supabase = await createClient();
    const { data, error } = await supabase.from("clients").select("*").order("name");
    if (error || !data) return [];
    return data.map(toInternalClient);
  },

  async getClientBySlug(slug: string): Promise<InternalClient | null> {
    const supabase = await createClient();
    const { data, error } = await supabase.from("clients").select("*").eq("slug", slug).single();
    if (error || !data) return null;
    return toInternalClient(data);
  },
};
