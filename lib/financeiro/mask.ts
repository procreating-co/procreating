/**
 * Mascaramento financeiro pro papel `dev_tester` — pedido explícito ("Coloque 3x o valor de
 * tudo!"): em vez de trocar cada R$ por "R$ ••••" (comportamento antigo), `dev_tester` agora vê
 * o valor REAL vezes 3 em toda tela financeira (Financeiro e Home) — a interface continua
 * parecendo funcional/realista durante teste de UI/UX, sem nunca expor o número verdadeiro da
 * empresa pro navegador (a multiplicação acontece aqui, em Server Component/ação pura — o
 * cliente nunca recebe o valor original). Nenhum outro papel sem `canViewFinancials` (comercial,
 * marketing, operação, produção, cliente) ganha essa regra — pra eles o comportamento antigo
 * ("R$ ••••"/gráfico oculto) continua valendo, só `dev_tester` é "mascarado com 3x".
 *
 * Sem `"server-only"` de propósito — usado tanto em Server Components (`app/(internal)/page.tsx`,
 * `app/(internal)/financeiro/page.tsx`) quanto em Client Components (`costs-list.tsx`,
 * `financial-entries-table.tsx`, `dashboard-date-header.tsx`) que já recebem só o valor
 * pós-decisão de RBAC (nunca leem `role` sozinhos).
 */
export const MASKED_VALUE_MULTIPLIER = 3;

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/** Valor cru (número) → aplica o multiplicador quando `masked`, senão devolve como veio. */
export function maskAmount(value: number, masked: boolean): number {
  return masked ? value * MASKED_VALUE_MULTIPLIER : value;
}

/** Formata direto pro texto em R$, já aplicando o multiplicador quando `masked`. */
export function formatMaskedCurrency(value: number, masked: boolean): string {
  return currencyFormatter.format(maskAmount(value, masked));
}

/** Pra textos JÁ formatados em R$ (`FinancialDetailEntry.value`/`DetailEntry.value`, que chegam
 *  prontos de `lib/financeiro/queries.ts`/`lib/dashboard/executive-metrics.ts`, às vezes com
 *  prefixo/sufixo — "+ R$ 3.200", "R$ 3.200/mês") — encontra toda ocorrência de "R$ <dígitos>"
 *  no texto e troca pelo valor × 3, preservando o resto do texto ao redor intacto. Só roda
 *  quando `masked`; senão devolve o texto original sem tocar. */
export function maskCurrencyText(text: string, masked: boolean): string {
  if (!masked) return text;
  return text.replace(/R\$\s?[\d.]+/g, (match) => currencyFormatter.format(Number(match.replace(/[^\d]/g, "")) * MASKED_VALUE_MULTIPLIER));
}
