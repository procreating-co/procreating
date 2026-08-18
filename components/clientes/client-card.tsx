import { StatusDot, type StatusTone } from "@/components/dashboard/status-dot";
import { CONTRACT_CATEGORY_LABEL, CONTRACT_CATEGORY_TONE } from "@/lib/financeiro/contract-category";
import type { ClientCardData } from "@/lib/clientes/queries";
import type { ClientStatus } from "@/lib/supabase/types/database";

export const CLIENT_STATUS_TONE: Record<ClientStatus, StatusTone> = {
  lead: "neutral",
  onboarding: "pending",
  ativo: "active",
  atencao: "pending",
  risco: "danger",
  churn: "danger",
};

export const CLIENT_STATUS_LABEL: Record<ClientStatus, string> = {
  lead: "Lead",
  onboarding: "Onboarding",
  ativo: "Ativo",
  atencao: "Atenção",
  risco: "Risco",
  churn: "Churn",
};

/** "2h atrás"/"3 dias atrás" — só minutos/horas/dias (não existe caso de uso pra semanas/meses
 *  aqui, cliente que não recebe update há tanto tempo já vira preocupação de status, não de
 *  formatação). */
export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "agora mesmo";
  if (minutes < 60) return `${minutes}min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

/**
 * Card de cliente da Central de Clientes — bloco inteiro clicável (o `<button>` que embrulha
 * isto mora em `clients-grid.tsx`, aqui é só a apresentação). "Cliente recorrente"/"Projeto
 * único"/"N projetos" e as categorias vêm de `contracts` de verdade (`ContractCategory`), nunca
 * inventados — um cliente sem nenhum contrato ainda (`contractCount === 0`, ex. onboarding recém
 * criado) mostra isso explicitamente, não finge ter "0 projetos" como se fosse um dado normal.
 */
export function ClientCard({ data, onOpen }: { data: ClientCardData; onOpen: () => void }) {
  const { client, categories, contractCount } = data;
  const isRecurring = categories.includes("recorrente_ativo");

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-4 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-border hover:bg-card/70 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground/10 font-mono text-xs text-muted-foreground">{initials(client.name)}</span>
          <div className="min-w-0">
            <p className="truncate font-medium">{client.name}</p>
            {client.segment && <p className="truncate text-xs text-muted-foreground">{client.segment}</p>}
          </div>
        </div>
        <StatusDot tone={CLIENT_STATUS_TONE[client.status]} label={CLIENT_STATUS_LABEL[client.status]} />
      </div>

      <div className="flex flex-col gap-1 text-sm">
        <p className="text-muted-foreground">
          {contractCount === 0 ? "Sem contrato ainda" : contractCount === 1 ? "1 projeto" : `${contractCount} projetos`}
          {isRecurring && " · Cliente recorrente"}
        </p>
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {categories.map((category) => (
              <StatusDot key={category} tone={CONTRACT_CATEGORY_TONE[category]} label={CONTRACT_CATEGORY_LABEL[category]} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-2.5 text-xs text-muted-foreground">
        <span>Última atualização</span>
        <span className="font-mono tabular-nums">{timeAgo(client.updated_at)}</span>
      </div>
    </button>
  );
}
