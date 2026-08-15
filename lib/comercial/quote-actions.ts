"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/current-user";
import { listServiceCatalog, listQuotesForLead, type QuoteWithItems } from "@/lib/comercial/quotes";
import type { QuoteStatus, ServiceCatalogItem } from "@/lib/supabase/types/database";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Wrappers `"use server"` — `lib/comercial/quotes.ts` é `server-only`, só chamável de Server
 *  Component; o builder (`components/comercial/quote-builder-dialog.tsx`) roda no client. */
export async function getServiceCatalogAction(): Promise<ServiceCatalogItem[]> {
  return listServiceCatalog();
}

export async function getQuotesForLeadAction(leadId: string): Promise<QuoteWithItems[]> {
  return listQuotesForLead(leadId);
}

export type QuoteItemInput = { serviceName: string; description: string; quantity: number; unitPrice: number };

/** Cria o orçamento + os itens numa chamada — cada item que não existir ainda no catálogo
 *  (comparado por nome, case-insensitive) entra lá também, pra reaproveitar da próxima vez sem
 *  precisar de uma tela de cadastro separada. Preço gravado no ITEM (`unit_price`), nunca uma
 *  referência viva ao catálogo — ver nota da migration. */
export async function createQuoteAction(input: { leadId: string; title: string; notes: string; items: QuoteItemInput[] }): Promise<ActionResult> {
  if (!input.title.trim()) return { ok: false, error: "Dê um título ao orçamento." };
  if (input.items.length === 0) return { ok: false, error: "Adicione ao menos um item." };
  if (input.items.some((item) => !item.serviceName.trim())) return { ok: false, error: "Todo item precisa de um nome de serviço." };

  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Sessão expirada — faça login de novo." };

  const supabase = await createClient();

  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .insert({ lead_id: input.leadId, title: input.title, notes: input.notes || null, created_by: userId })
    .select("id")
    .single();
  if (quoteError || !quote) return { ok: false, error: quoteError?.message ?? "Não foi possível criar o orçamento." };

  const { error: itemsError } = await supabase.from("quote_items").insert(
    input.items.map((item) => ({
      quote_id: quote.id,
      service_name: item.serviceName,
      description: item.description || null,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    })),
  );
  if (itemsError) return { ok: false, error: itemsError.message };

  const { data: catalog } = await supabase.from("service_catalog").select("name");
  const existingNames = new Set((catalog ?? []).map((row) => row.name.trim().toLowerCase()));
  const newCatalogItems = input.items.filter((item) => !existingNames.has(item.serviceName.trim().toLowerCase()));
  if (newCatalogItems.length > 0) {
    await supabase.from("service_catalog").insert(
      newCatalogItems.map((item) => ({ name: item.serviceName, default_price: item.unitPrice, created_by: userId })),
    );
  }

  revalidatePath("/comercial");
  return { ok: true };
}

export async function updateQuoteStatusAction(quoteId: string, status: QuoteStatus): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("quotes").update({ status, updated_at: new Date().toISOString() }).eq("id", quoteId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/comercial");
  return { ok: true };
}
