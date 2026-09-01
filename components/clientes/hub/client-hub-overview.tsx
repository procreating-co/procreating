import { ArrowUpRight, CalendarClock, CheckCircle2, Clapperboard, ImageIcon, Send } from "lucide-react";
import { StatTile } from "@/components/dashboard/stat-tile";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PRODUCTION_PROJECT_STATUS_LABEL, PRODUCTION_PROJECT_STATUS_TONE } from "@/lib/operacao/types";
import { StatusDot } from "@/components/dashboard/status-dot";
import { optimizedGallerySrc } from "@/lib/gallery";
import type { ClientHubOverview, UpcomingDelivery } from "@/lib/operacao/queries";
import type { RecentGalleryFile } from "@/lib/gallery-server";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

/** "Visão geral" do Client Hub — 4 contadores (`ClientHubOverview`, `production_items`
 *  `kind='conteudo'`), "Últimos materiais" (galeria em disco, mesma fonte da página pública) e
 *  "Próximas entregas" (`production_projects.deadline`, real, sem depender da migration nova). */
export function ClientHubOverviewSection({
  overview,
  recentMedia,
  upcomingDeliveries,
  publicUrl,
}: {
  overview: ClientHubOverview;
  recentMedia: RecentGalleryFile[];
  upcomingDeliveries: UpcomingDelivery[];
  publicUrl: string;
}) {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile demo={false} label="Próximas publicações" value={String(overview.upcomingPublications)} icon={<CalendarClock className="size-4.5" />} tone="brand" />
        <StatTile demo={false} label="Em produção" value={String(overview.inProduction)} icon={<Clapperboard className="size-4.5" />} tone="warning" />
        <StatTile demo={false} label="Em aprovação" value={String(overview.inReview)} icon={<Send className="size-4.5" />} tone="info" />
        <StatTile demo={false} label="Publicados no mês" value={String(overview.publishedThisMonth)} icon={<CheckCircle2 className="size-4.5" />} tone="neutral" />
      </div>

      {/* Card de destaque — pedido explícito, entrada separada pro projeto inicial, nunca o
       *  conteúdo dele replicado aqui dentro. */}
      <a
        href={publicUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-wrap items-center justify-between gap-4 rounded-xl border border-brand-subtle-border bg-gradient-to-br from-brand-subtle to-card p-5 transition-colors hover:border-brand/40"
      >
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-xl">Acessar projeto inicial</h2>
          <p className="max-w-md text-sm text-muted-foreground">Consulte todo o material desenvolvido na etapa inicial do projeto.</p>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-neutral-900 transition-colors group-hover:bg-neutral-200">
          Abrir
          <ArrowUpRight className="size-3.5" />
        </span>
      </a>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-5">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Últimos materiais</h2>
          {recentMedia.length === 0 ? (
            <EmptyState icon={ImageIcon} title="Nenhum material na galeria ainda." fullBleed={false} />
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {recentMedia.map((file) => (
                <div key={file.src} className="aspect-square overflow-hidden rounded-lg border border-border/60 bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element -- mesmo padrão de gallery-experience.tsx (fora do otimizador de layout do next/image, já usa /_next/image via optimizedGallerySrc) */}
                  <img src={optimizedGallerySrc(file.src, 160)} alt={file.fileName} className="size-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-5">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Próximas entregas</h2>
          {upcomingDeliveries.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma entrega com prazo definido no momento.</p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {upcomingDeliveries.map((delivery) => (
                <li key={delivery.id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{delivery.name}</span>
                    <span className="text-xs text-muted-foreground">{dateFormatter.format(new Date(`${delivery.deadline}T00:00:00`))}</span>
                  </div>
                  <StatusDot tone={PRODUCTION_PROJECT_STATUS_TONE[delivery.status]} label={PRODUCTION_PROJECT_STATUS_LABEL[delivery.status]} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
