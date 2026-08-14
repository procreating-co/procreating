import type { DetailEntry } from "@/lib/dashboard/executive-metrics";

/** Lista simples label/valor/meta usada dentro dos modais de detalhe (`CardWithDetail`) — mesmo
 *  formato pra tudo: nome + valor à direita + uma segunda linha pequena (data, estágio, cargo,
 *  %). Rolagem própria a partir de ~8 itens, não estica o modal indefinidamente. */
export function DetailList({ items, emptyLabel }: { items: DetailEntry[]; emptyLabel: string }) {
  if (items.length === 0) return <p className="py-6 text-center text-sm text-muted-foreground">{emptyLabel}</p>;

  return (
    <ul className="flex max-h-80 flex-col divide-y divide-border/60 overflow-y-auto rounded-lg border border-border/60">
      {items.map((item, index) => (
        <li key={`${item.label}-${index}`} className="flex items-center justify-between gap-4 px-3.5 py-2.5 text-sm">
          <div className="min-w-0 flex-1">
            <p className="truncate">{item.label}</p>
            {item.meta && <p className="truncate text-xs text-muted-foreground">{item.meta}</p>}
          </div>
          {item.value && <span className="shrink-0 tabular-nums text-muted-foreground">{item.value}</span>}
        </li>
      ))}
    </ul>
  );
}
