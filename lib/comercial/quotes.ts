import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Quote, QuoteItem, ServiceCatalogItem } from "@/lib/supabase/types/database";

export type QuoteWithItems = Quote & { items: QuoteItem[]; total: number };

export async function listServiceCatalog(): Promise<ServiceCatalogItem[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("service_catalog").select("*").order("name");
  return data ?? [];
}

/** Orçamentos de um lead específico — usado no drawer de detalhe (`LeadDetailDrawer`). Junção
 *  manual em TS, mesmo padrão do resto do módulo Comercial (`lib/comercial/queries.ts`). */
export async function listQuotesForLead(leadId: string): Promise<QuoteWithItems[]> {
  const supabase = await createClient();
  const { data: quotes } = await supabase.from("quotes").select("*").eq("lead_id", leadId).order("created_at", { ascending: false });
  if (!quotes || quotes.length === 0) return [];

  const { data: items } = await supabase
    .from("quote_items")
    .select("*")
    .in(
      "quote_id",
      quotes.map((q) => q.id),
    );

  return quotes.map((quote) => {
    const quoteItems = (items ?? []).filter((item) => item.quote_id === quote.id);
    return { ...quote, items: quoteItems, total: quoteItems.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unit_price), 0) };
  });
}
