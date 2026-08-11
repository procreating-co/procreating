"use client";

import { useMemo, useState } from "react";
import { Building2, Handshake, MessageSquare, Search, Send, Target } from "lucide-react";
import { useOficinas } from "@/components/prospeccao/oficinas-store";
import { LeadDetailDrawer } from "@/components/prospeccao/lead-detail-drawer";
import { cn } from "@/lib/utils";

/** Mesma paleta das etapas do funil (`stages.ts`) — cada card puxa pro tom da etapa que conta. */
type StatTone = "accent" | "neutral" | "sky" | "violet" | "emerald" | "emeraldStrong";

const TONE_CLASSES: Record<StatTone, { icon: string; ring: string }> = {
  accent: { icon: "text-[var(--client-accent)]", ring: "border-[var(--client-accent)]/25" },
  neutral: { icon: "text-white/45", ring: "border-white/10" },
  sky: { icon: "text-sky-400", ring: "border-sky-500/20" },
  violet: { icon: "text-violet-400", ring: "border-violet-500/20" },
  emerald: { icon: "text-emerald-400", ring: "border-emerald-500/20" },
  emeraldStrong: { icon: "text-emerald-300", ring: "border-emerald-400/30" },
};

function StatCard({ icon: Icon, label, value, tone = "neutral" }: { icon: typeof Building2; label: string; value: number; tone?: StatTone }) {
  const t = TONE_CLASSES[tone];
  return (
    <div className={cn("rounded-xl border bg-white/[0.03] px-5 py-4", t.ring)}>
      <div className="flex items-center gap-2">
        <Icon className={cn("size-4", t.icon)} />
        <span className="font-mono text-[11px] uppercase tracking-wide text-white/40">{label}</span>
      </div>
      <p className="mt-2 font-display text-3xl text-white">{value}</p>
    </div>
  );
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.round(hours / 24);
  return `há ${days}d`;
}

export function OverviewView() {
  const { oficinas } = useOficinas();
  const [openLeadId, setOpenLeadId] = useState<string | null>(null);

  const stats = useMemo(
    () => ({
      total: oficinas.length,
      naoProspectadas: oficinas.filter((o) => o.status === "contato").length,
      emProspeccao: oficinas.filter((o) => o.status === "abordado" || o.status === "follow_up").length,
      emConversa: oficinas.filter((o) => o.status === "em_conversa").length,
      oportunidades: oficinas.filter((o) => o.status === "oportunidade").length,
      parceiros: oficinas.filter((o) => o.status === "parceiro").length,
    }),
    [oficinas],
  );

  const recentActivity = useMemo(() => {
    return oficinas
      .flatMap((oficina) => oficina.history.map((entry) => ({ ...entry, oficinaId: oficina.id, oficinaNome: oficina.nome })))
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 8);
  }, [oficinas]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={Building2} label="Total de oficinas" value={stats.total} tone="accent" />
        <StatCard icon={Target} label="Não prospectadas" value={stats.naoProspectadas} tone="neutral" />
        <StatCard icon={Send} label="Em prospecção" value={stats.emProspeccao} tone="sky" />
        <StatCard icon={MessageSquare} label="Em conversa" value={stats.emConversa} tone="violet" />
        <StatCard icon={Search} label="Oportunidades" value={stats.oportunidades} tone="emerald" />
        <StatCard icon={Handshake} label="Parceiros" value={stats.parceiros} tone="emeraldStrong" />
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <h2 className="font-mono text-[11px] uppercase tracking-wide text-white/40">Atividades recentes</h2>
        {recentActivity.length === 0 ? (
          <p className="mt-4 text-sm text-white/40">Nenhuma atividade registrada ainda.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {recentActivity.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => setOpenLeadId(entry.oficinaId)}
                  className="flex w-full items-baseline justify-between gap-3 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-white/[0.04]"
                >
                  <span className="text-white/80">
                    <span className="font-medium text-white">{entry.oficinaNome}</span> — {entry.message}
                  </span>
                  <span className="shrink-0 font-mono text-[11px] text-white/35">{timeAgo(entry.at)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <LeadDetailDrawer oficinaId={openLeadId} onOpenChange={(open) => !open && setOpenLeadId(null)} />
    </div>
  );
}
