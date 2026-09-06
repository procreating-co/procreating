/**
 * Identidade de visitante anônimo pro tracking granular (brief "Procreating Experiences", §9) —
 * client-safe (chamado só de dentro de `useEffect`/Client Component, nunca em Server Component).
 *
 * `pc_vid` — cookie de 1ª parte, TTL longo (1 ano), sem PII (só um UUID aleatório). Gerado na
 * primeira visita a qualquer página pública de Proposta, reenviado a cada evento — é o que
 * distingue "voltou outra vez" de "visitante novo" entre visitas diferentes.
 */
const VISITOR_COOKIE = "pc_vid";
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 ano

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, maxAgeSeconds: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAgeSeconds}; path=/; samesite=lax`;
}

/** Lê o cookie existente ou cria um novo (grava na hora) — sempre devolve um id válido. */
export function getOrCreateVisitorId(): string {
  const existing = readCookie(VISITOR_COOKIE);
  if (existing) return existing;
  const fresh = crypto.randomUUID();
  writeCookie(VISITOR_COOKIE, fresh, VISITOR_COOKIE_MAX_AGE);
  return fresh;
}

/** 1 por carregamento de página — nunca persiste (sem cookie), só existe na memória do
 *  componente que chamar isto (`useState(() => createSessionId())`/`useRef`). */
export function createSessionId(): string {
  return crypto.randomUUID();
}
