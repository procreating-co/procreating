import { Eye, MousePointerClick, Users } from "lucide-react";
import { StatTile } from "@/components/dashboard/stat-tile";
import { EmptyState } from "@/components/dashboard/empty-state";
import { SECTION_TYPE_LABEL } from "@/lib/comercial/proposal-content-types";
import type { ProposalAnalyticsSummary } from "@/lib/comercial/proposal-analytics-queries";

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

const EVENT_LABEL: Record<string, string> = {
  section_view: "Viu a seção",
  scroll_depth: "Rolou até",
  cta_click: "Clicou em Aceitar",
  video_play: "Deu play no vídeo",
  video_progress: "Assistiu até",
  video_complete: "Assistiu o vídeo inteiro",
};

/**
 * Analytics de uma Proposal (brief "Procreating Experiences", Fase 6/7) — visitantes únicos,
 * sessões, cliques no CTA (StatTiles, mesmo componente do resto do ERP), "barras de engajamento
 * por seção" (§10 — dwell/reach map, NÃO heatmap de clique/posição de mouse, rotulado como tal de
 * propósito) e vídeos, mais a atividade bruta recente. Tudo a partir de `proposal_events`
 * (`computeProposalAnalytics`) — nenhum número inventado; sem eventos ainda, cada bloco mostra
 * seu próprio estado vazio em vez de "0%" forçado.
 */
export function ProposalAnalyticsPanel({ data }: { data: ProposalAnalyticsSummary }) {
  const hasAnyEvent = data.sessions > 0;

  if (!hasAnyEvent) {
    return (
      <EmptyState
        icon={Eye}
        title="Ainda sem dado de engajamento"
        description="Aparece aqui assim que alguém abrir o link público depois desta atualização — visitantes únicos, seções vistas, vídeos assistidos, cliques no CTA."
        fullBleed={false}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile demo={false} label="Visitantes únicos" value={String(data.uniqueVisitors)} icon={<Users className="size-4.5" />} tone="brand" />
        <StatTile demo={false} label="Sessões (carregamentos)" value={String(data.sessions)} icon={<Eye className="size-4.5" />} tone="info" />
        <StatTile demo={false} label="Cliques em Aceitar" value={String(data.ctaClicks)} icon={<MousePointerClick className="size-4.5" />} tone="success" />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Engajamento por seção</h2>
        <p className="-mt-1 text-xs text-muted-foreground">% das sessões que chegaram a ver cada seção — não é heatmap de clique, é alcance/permanência por bloco de conteúdo.</p>
        {data.sectionEngagement.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma seção com visualização registrada ainda.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {data.sectionEngagement.map((row) => (
              <div key={row.sectionType} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-sm text-muted-foreground">{SECTION_TYPE_LABEL[row.sectionType]}</span>
                <div className="relative h-6 flex-1 overflow-hidden rounded-md bg-muted">
                  <div className="absolute inset-y-0 left-0 rounded-md bg-brand transition-all" style={{ width: `${row.viewedPct}%` }} />
                </div>
                <span className="w-12 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{row.viewedPct}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {data.videoEngagement.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Vídeos</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {data.videoEngagement.map((row) => (
              <div key={row.sectionType} className="flex flex-col gap-1 rounded-xl border border-border/60 bg-card/40 p-4">
                <p className="text-sm font-medium">{SECTION_TYPE_LABEL[row.sectionType]}</p>
                <p className="text-xs text-muted-foreground">
                  {row.plays} play{row.plays === 1 ? "" : "s"} · {row.completions} completo{row.completions === 1 ? "" : "s"}
                  {row.avgProgress != null && ` · ${row.avgProgress}% assistido em média`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Atividade recente</h2>
        <ul className="flex max-h-96 flex-col divide-y divide-border/60 overflow-y-auto rounded-xl border border-border/60 bg-card/40">
          {data.activity.map((entry, index) => (
            <li key={index} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
              <span>
                {EVENT_LABEL[entry.eventType] ?? entry.eventType}
                {entry.sectionType && ` — ${SECTION_TYPE_LABEL[entry.sectionType]}`}
                {entry.value != null && ` (${entry.value}%)`}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">{dateTimeFormatter.format(new Date(entry.createdAt))}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
