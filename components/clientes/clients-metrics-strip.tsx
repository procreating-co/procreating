import type { ClientsOverview } from "@/lib/clientes/queries";

/**
 * Faixa de métricas compacta do topo da Central de Clientes — 4 números, todos derivados do
 * MESMO `ClientsOverview` já carregado pra página inteira (nunca uma segunda query em paralelo
 * pro mesmo tipo de número, mesmo raciocínio já aplicado no resto do produto: "Dashboard deve
 * ser o resultado do Financeiro"). Sem mock — os 4 valores existem de verdade no banco hoje.
 *
 * "Clientes recorrentes" saiu daqui (era igual a "Total de clientes" sempre, desde que
 * `listClientsOverview` passou a filtrar só recorrentes — número duplicado lado a lado) — virou
 * "Em atenção", genuinamente outro recorte (quem, dentro dos recorrentes, está sinalizado).
 */
export function ClientsMetricsStrip({ overview }: { overview: ClientsOverview }) {
  const { rows, activeContractsCount } = overview;
  const activeClients = rows.filter((row) => row.client.status === "ativo").length;
  const needsAttention = rows.filter((row) => row.client.status === "atencao" || row.client.status === "risco").length;

  const items = [
    { label: "Clientes ativos", value: activeClients },
    { label: "Em atenção", value: needsAttention },
    { label: "Contratos pontuais em andamento", value: activeContractsCount },
    { label: "Total de clientes recorrentes", value: rows.length },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-border/60 bg-card/40 px-4 py-3">
          <p className="font-mono text-2xl tabular-nums">{item.value}</p>
          <p className="text-xs text-muted-foreground">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
