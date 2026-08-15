import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { FinancialRule } from "@/lib/supabase/types/database";

export type PartnerDistributionEntry = { userId: string; name: string; percentage: number; amount: number };

export type DistributionResult = {
  revenue: number;
  operationalPercentage: number;
  operationalAmount: number;
  distributable: number;
  partners: PartnerDistributionEntry[];
};

/** Regra 20/80 corrente — uma linha só (sem histórico versionado nesta fase). `null` se a
 *  migration ainda não rodou/seedou (não deveria acontecer em produção, mas não assume). */
export async function getFinancialRule(): Promise<FinancialRule | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("financial_rules").select("*").order("created_at", { ascending: false }).limit(1).maybeSingle();
  return data ?? null;
}

/**
 * Único lugar que sabe a regra de distribuição — faturamento → operacional → distribuível →
 * valor por sócio. Nunca hardcoded em componente; `/financeiro/distribuicao` e qualquer cálculo
 * futuro (Home, relatórios) chamam esta função.
 *
 * Divisão entre sócios: `partner_shares` sobrescreve quem tiver uma linha lá; o resto dos 100%
 * (nunca dos 80% distribuíveis — `percentage` em `partner_shares` é sobre o total distribuível)
 * divide igualmente entre os `users.member_type === "socio"` sem override. Sem nenhuma linha em
 * `partner_shares`, isso é só "divide igual entre todos os sócios" — o "50/50 por padrão" que
 * o prompt pediu, sem cravar os dois sócios como constante.
 *
 * Era `role === "owner"` até o seed de dados reais (Eduardo é sócio — `member_type: "socio"` —
 * mas "FULL / NOT ADMIN", ou seja `role: "admin"`, não `"owner"`) — `role` é nível de permissão
 * de app (hoje decorativo, sem RBAC real ainda), `member_type` é "é sócio pra fins de divisão de
 * lucro". Os dois deixaram de ser a mesma pergunta.
 */
export async function computeDistribution(revenue: number): Promise<DistributionResult> {
  const rule = await getFinancialRule();
  const operationalPercentage = rule?.operational_percentage ?? 20;
  const operationalAmount = revenue * (operationalPercentage / 100);
  const distributable = revenue - operationalAmount;

  const supabase = await createClient();
  const [{ data: owners }, { data: shares }] = await Promise.all([
    supabase.from("users").select("*").eq("member_type", "socio"),
    supabase.from("partner_shares").select("*"),
  ]);

  const ownersList = owners ?? [];
  const percentageByUserId = new Map((shares ?? []).map((share) => [share.user_id, Number(share.percentage)]));

  const withoutOverride = ownersList.filter((owner) => !percentageByUserId.has(owner.id));
  const overriddenTotal = ownersList.reduce((sum, owner) => sum + (percentageByUserId.get(owner.id) ?? 0), 0);
  const remainingPercentage = Math.max(0, 100 - overriddenTotal);
  const evenShare = withoutOverride.length > 0 ? remainingPercentage / withoutOverride.length : 0;

  const partners: PartnerDistributionEntry[] = ownersList.map((owner) => {
    const percentage = percentageByUserId.get(owner.id) ?? evenShare;
    return { userId: owner.id, name: owner.name, percentage, amount: distributable * (percentage / 100) };
  });

  return { revenue, operationalPercentage, operationalAmount, distributable, partners };
}
