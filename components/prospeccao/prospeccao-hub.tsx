"use client";

import { useState } from "react";
import { ArrowLeft, Building2, FileText, LayoutDashboard, Lightbulb, Trello } from "lucide-react";
import { AnimatedRevealText } from "@/components/shared/animated-reveal-text";
import { OverviewView } from "@/components/prospeccao/views/overview-view";
import { OficinasView } from "@/components/prospeccao/views/oficinas-view";
import { GestaoView } from "@/components/prospeccao/views/gestao-view";
import { ScriptsView } from "@/components/prospeccao/views/scripts-view";
import { EstrategiasView } from "@/components/prospeccao/views/estrategias-view";
import { cn } from "@/lib/utils";

const TABS = [
  { value: "visao-geral", label: "Visão Geral", icon: LayoutDashboard },
  { value: "oficinas", label: "Oficinas", icon: Building2 },
  { value: "gestao", label: "Gestão", icon: Trello },
  { value: "scripts", label: "Scripts", icon: FileText },
  { value: "estrategias", label: "Estratégias", icon: Lightbulb },
] as const;

type TabValue = (typeof TABS)[number]["value"];

export type ProspeccaoHubProps = {
  title: string;
  homeHref: string;
};

/**
 * Central de Prospecção — shell com navegação por abas. As quatro áreas (Oficinas, Gestão,
 * Scripts, Estratégias) leem do mesmo `OficinasProvider`/`ScriptsProvider`/`StrategiesProvider`
 * (montados em `ProspeccaoExperience`), então trocar de aba nunca perde ou duplica dado — é o
 * mesmo estado, só outra visualização dele.
 */
export function ProspeccaoHub({ title, homeHref }: ProspeccaoHubProps) {
  const [tab, setTab] = useState<TabValue>("visao-geral");

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 pb-16 pt-8 text-white lg:px-12 lg:pt-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center gap-4">
          <a
            href={homeHref}
            aria-label="Voltar para a página inicial"
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] text-white/70 transition-colors hover:border-[var(--client-accent)] hover:text-[var(--client-accent)]"
          >
            <ArrowLeft className="size-5" />
          </a>
          <h1 className="text-balance font-display text-3xl leading-[0.95] tracking-tight sm:text-4xl">
            <AnimatedRevealText text={title} delayMs={18} />
          </h1>
        </div>

        <nav className="mb-6 flex flex-wrap gap-1 border-b border-white/10">
          {TABS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              aria-current={tab === value}
              className={cn(
                "flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors",
                tab === value ? "border-[var(--client-accent)] text-white" : "border-transparent text-white/45 hover:text-white/80",
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </nav>

        {tab === "visao-geral" && <OverviewView />}
        {tab === "oficinas" && <OficinasView />}
        {tab === "gestao" && <GestaoView />}
        {tab === "scripts" && <ScriptsView />}
        {tab === "estrategias" && <EstrategiasView />}
      </div>
    </main>
  );
}
