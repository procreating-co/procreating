/** Formata um timestamp ISO como data+hora em pt-BR (ex.: "28 jul 2026, 14:32"). */
export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
