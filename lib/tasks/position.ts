/**
 * Posição fracionária (§8 do pedido) — mover uma tarefa recalcula SÓ ELA (média entre as duas
 * vizinhas na nova posição, ou ±1000 numa ponta da lista), nunca renumera a lista inteira.
 * `double precision` aguenta muitas inserções no mesmo intervalo antes de precisar de qualquer
 * rebalanceamento (cada média divide o espaço restante ao meio) — se um dia esgotar a precisão de
 * ponto flutuante nesse intervalo (miríades de reordenações no mesmo lugar exato), um
 * rebalanceamento completo da lista resolveria, mas está muito longe do volume real deste
 * produto pra justificar agora.
 */
const GAP = 1000;

/** `beforePosition`/`afterPosition`: posição da tarefa logo antes/depois de onde a arrastada
 *  pousou (`null` = não existe, é a ponta da lista). */
export function computePositionBetween(beforePosition: number | null, afterPosition: number | null): number {
  if (beforePosition === null && afterPosition === null) return GAP;
  if (beforePosition === null) return afterPosition! - GAP;
  if (afterPosition === null) return beforePosition + GAP;
  return (beforePosition + afterPosition) / 2;
}
