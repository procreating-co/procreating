"use client";

import { useMemo, useState } from "react";
import { Building2, Handshake, MessageSquare, Search, Send, Target } from "lucide-react";
import { useOficinas } from "@/components/prospeccao/oficinas-store";
import { LeadDetailDrawer } from "@/components/prospeccao/lead-detail-drawer";

function StatCard({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
      <div className="flex items-center gap-2 text-white/40">
        <Icon className="size-4" />
        <span className="font-mono text-[11px] uppercase tracking-wide">{label}</span>
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
        <StatCard icon={Building2} label="Total de oficinas" value={stats.total} />
        <StatCard icon={Target} label="Não prospectadas" value={stats.naoProspectadas} />
        <StatCard icon={Send} label="Em prospecção" value={stats.emProspeccao} />
        <StatCard icon={MessageSquare} label="Em conversa" value={stats.emConversa} />
        <StatCard icon={Search} label="Oportunidades" value={stats.oportunidades} />
        <StatCard icon={Handshake} label="Parceiros" value={stats.parceiros} />
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
