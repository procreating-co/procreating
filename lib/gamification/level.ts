/**
 * Fórmula de nível — num só lugar, consumida tanto por `queries.ts`/componentes (TypeScript)
 * quanto espelhada em `check_achievements` (SQL, migration `20260814210000_
 * workspace_gamification.sql`) pra avaliar as conquistas `criteria_type: 'level'`. Mudar uma
 * exige mudar a outra.
 *
 * Simples e visível de propósito (100 XP por nível, flat) — sem curva escondida nem multiplicador
 * "mágico". A barra de progresso mostra exatamente "X/100 XP pro próximo nível".
 */
const XP_PER_LEVEL = 100;

export function levelForXp(totalXp: number): number {
  return Math.floor(Math.max(0, totalXp) / XP_PER_LEVEL) + 1;
}

export function xpIntoLevel(totalXp: number): number {
  return Math.max(0, totalXp) % XP_PER_LEVEL;
}

export function xpToNextLevel(totalXp: number): number {
  return XP_PER_LEVEL - xpIntoLevel(totalXp);
}

export function levelProgressPercentage(totalXp: number): number {
  return (xpIntoLevel(totalXp) / XP_PER_LEVEL) * 100;
}

export { XP_PER_LEVEL };
