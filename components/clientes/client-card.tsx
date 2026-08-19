import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { StatusDot, type StatusTone } from "@/components/dashboard/status-dot";
import { CONTRACT_CATEGORY_LABEL, CONTRACT_CATEGORY_TONE } from "@/lib/financeiro/contract-category";
import type { ClientCardData } from "@/lib/clientes/queries";
import type { ClientStatus, ProjectStage } from "@/lib/supabase/types/database";

/** Rótulos do funil Projeto→Recorrente (pedido explícito, "guarde isso na sua memória" —
 *  Planejamento → Roteirização → Captação Realizada → Edição → Entregue → Em negociação →
 *  Fechado). "Fechado" não deveria aparecer de fato — nesse estágio o cliente já virou
 *  recorrente e o campo volta a `null` (ver comentário na coluna `clients.project_stage`). */
export const PROJECT_STAGE_LABEL: Record<ProjectStage, string> = {
  planejamento: "Planejamento",
  roteirizacao: "Roteirização",
  captacao_realizada: "Captação Realizada",
  edicao: "Edição",
  entregue: "Entregue",
  em_negociacao: "Em negociação",
  fechado: "Fechado",
};

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
 * Card de cliente da Central de Clientes — bloco inteiro clicável, navega em tela cheia pra
 * `/clientes/[id]` (pedido explícito: "ao clicar no nome... quero que abra full screen", em vez
 * do drawer lateral que existia antes — a rota `/clientes/[id]` já existia e nunca foi tocada,
 * só passou a ser o destino real do clique). "Cliente recorrente"/"Projeto único"/"N projetos" e
 * as categorias vêm de `contracts` de verdade (`ContractCategory`), nunca inventados — um
 * cliente sem nenhum contrato ainda (`contractCount === 0`, ex. onboarding recém criado) mostra
 * isso explicitamente, não finge ter "0 projetos" como se fosse um dado normal.
 *
 * "Acessar Home" — pedido explícito: link pro site público do cliente (`/clients/<slug>/public`,
 * domínio do Client Hub/portfólio — outra sessão é dona daquele código, mas um LINK saindo daqui
 * não mexe em nada de lá, só aponta pra URL). Sempre mostrado, mesmo pra cliente cuja página
 * ainda não existe ("essas páginas ainda não estão prontas mas já crie o botão" — pedido
 * explícito) — abre em nova aba (`target="_blank"`), sem sair do Procreating OS. Card virou
 * `<div>` com link "esticado" (`absolute inset-0`) fazendo o papel do clique-no-card-inteiro, o
 * botão "Acessar Home" fica por cima (`relative z-10`) com a própria área de clique — mesmo
 * padrão já usado em `components/operacao/projects-grid.tsx`, evita aninhar `<a>` dentro de `<a>`
 * (inválido em HTML).
 */
export function ClientCard({ data }: { data: ClientCardData }) {
  const { client, categories, contractCount } = data;

  return (
    <div className="group relative flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-border hover:bg-card/70 hover:shadow-lg">
      <Link
        href={`/clientes/${client.id}`}
        className="absolute inset-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={`Abrir ${client.name}`}
      />
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
        {/* "Cliente recorrente" saiu daqui — todo card nesta lista já É recorrente por definição
         *  (filtro em `listClientsOverview`), repetir isso em toda linha seria redundante com o
         *  badge "Recorrente Ativo" logo abaixo. */}
        <p className="text-muted-foreground">{contractCount === 0 ? "Sem contrato ainda" : contractCount === 1 ? "1 projeto" : `${contractCount} projetos`}</p>
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {categories.map((category) => (
              <StatusDot key={category} tone={CONTRACT_CATEGORY_TONE[category]} label={CONTRACT_CATEGORY_LABEL[category]} />
            ))}
          </div>
        )}
        {/* Estágio do funil Projeto→Recorrente — pedido explícito ("constar o status, ambas em
         *  Negociação"). Só aparece pra quem tem `project_stage` de verdade (Pascoal Bombas, Dra.
         *  Maria das Graças hoje), nunca inventado. */}
        {client.project_stage && client.project_stage !== "fechado" && (
          <div className="flex flex-wrap gap-1.5">
            <StatusDot tone="pending" label={PROJECT_STAGE_LABEL[client.project_stage]} />
          </div>
        )}
      </div>

      {/* Botão branco (pedido explícito, literal — não é um token de tema, é uma cor fixa
       *  deliberada) — se destaca como CTA em cima do card escuro, sempre visível pra todo
       *  cliente, mesmo quem ainda não tem página pública de verdade. */}
      <a
        href={`/clients/${client.slug}/public`}
        target="_blank"
        rel="noopener noreferrer"
        className="relative z-10 flex w-fit items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-neutral-900 transition-colors hover:bg-neutral-200"
      >
        Acessar Home
        <ArrowUpRight className="size-3" />
      </a>

      <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-2.5 text-xs text-muted-foreground">
        <span>Última atualização</span>
        <span className="font-mono tabular-nums">{timeAgo(client.updated_at)}</span>
      </div>
    </div>
  );
}
