"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Handshake, Target, TrendingUp, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buildScenarios } from "@/lib/simulation/engine";
import type { Scenario, SimulationDefaults, SimulationInput } from "@/lib/simulation/types";
import { cn } from "@/lib/utils";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const percentFormatter = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 0 });

const SCENARIO_LABEL: Record<Scenario["label"], string> = { conservador: "Conservador", base: "Base", agressivo: "Agressivo" };
const SCENARIO_HINT: Record<Scenario["label"], string> = {
  conservador: "conversão 30% pior que a informada",
  base: "conversão exatamente como informada",
  agressivo: "conversão 30% melhor que a informada",
};

/**
 * Master prompt §31/§32 — "Target revenue → Required recurring revenue → Clients → Deals →
 * Proposals → Meetings → Prospects → Lists", buscando dado que "o sistema já possui" em vez de
 * perguntar de novo. Meta e MRR agora vêm do Financeiro/Configurações reais (`defaults`), não
 * mais um `30000` fixo — e o cálculo de clientes necessários usa a LACUNA (meta − MRR já
 * confirmado), não a meta cheia, senão receita recorrente já fechada seria contada duas vezes.
 *
 * RBAC — decisão de produto: `canView=false` (papel sem `can_view_financials`) não bloqueia a
 * tela, só não pré-preenche Meta/MRR com o dado real (campos começam em branco). Sem seed real,
 * não existe mais número sensível pra mascarar — o simulador continua funcionando por inteiro
 * com o que a pessoa digitar, só sem partir do MRR/meta reais da empresa.
 */
export function SimulatorForm({ defaults, canView }: { defaults: SimulationDefaults; canView: boolean }) {
  const [input, setInput] = useState<SimulationInput>({
    revenueGoal: canView ? defaults.currentMonthGoal ?? 0 : 0,
    currentMrr: canView ? defaults.currentMrr : 0,
    averageTicket: defaults.averageTicket,
    leadToProposalRate: defaults.leadToProposalRate,
    proposalToSaleRate: defaults.proposalToSaleRate,
  });

  const scenarios = useMemo(() => buildScenarios(input), [input]);
  const base = scenarios.find((s) => s.label === "base")!;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 rounded-xl border border-border/60 bg-card/40 p-5 sm:grid-cols-2 lg:grid-cols-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="sim-goal">Meta de faturamento (R$)</Label>
          <Input
            id="sim-goal"
            type="number"
            inputMode="decimal"
            value={input.revenueGoal || ""}
            onChange={(e) => setInput((p) => ({ ...p, revenueGoal: Number(e.target.value) || 0 }))}
          />
          {canView && defaults.currentMonthGoal != null && <p className="text-[11px] text-muted-foreground">Pré-preenchido com a meta do mês (Configurações → Geral).</p>}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="sim-mrr">MRR atual (R$)</Label>
          <Input
            id="sim-mrr"
            type="number"
            inputMode="decimal"
            value={input.currentMrr || ""}
            onChange={(e) => setInput((p) => ({ ...p, currentMrr: Number(e.target.value) || 0 }))}
          />
          <p className="text-[11px] text-muted-foreground">Receita recorrente já confirmada — não conta como "a conquistar" abaixo.</p>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="sim-ticket">Ticket médio (R$)</Label>
          <Input
            id="sim-ticket"
            type="number"
            inputMode="decimal"
            value={input.averageTicket || ""}
            onChange={(e) => setInput((p) => ({ ...p, averageTicket: Number(e.target.value) || 0 }))}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="sim-l2p">Taxa lead → proposta (%)</Label>
          <Input
            id="sim-l2p"
            type="number"
            inputMode="decimal"
            value={Math.round(input.leadToProposalRate * 100) || ""}
            onChange={(e) => setInput((p) => ({ ...p, leadToProposalRate: (Number(e.target.value) || 0) / 100 }))}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="sim-p2s">Taxa proposta → venda (%)</Label>
          <Input
            id="sim-p2s"
            type="number"
            inputMode="decimal"
            value={Math.round(input.proposalToSaleRate * 100) || ""}
            onChange={(e) => setInput((p) => ({ ...p, proposalToSaleRate: (Number(e.target.value) || 0) / 100 }))}
          />
        </div>
      </div>

      {!canView && (
        <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/40 px-4 py-3 text-sm text-muted-foreground">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>Meta e MRR reais da empresa ficam ocultos para seu papel — os campos abaixo começam em branco, mas o simulador funciona normalmente com os valores que você digitar.</p>
        </div>
      )}

      {canView && defaults.currentMonthGoal == null && (
        <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning-subtle px-4 py-3 text-sm text-warning">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>
            Nenhuma meta configurada pro mês corrente ainda — o campo acima começou em R$0.{" "}
            <a href="/configuracoes/geral" className="underline underline-offset-2">
              Defina uma em Configurações → Geral
            </a>{" "}
            pra este simulador (e o Dashboard) partirem do número real.
          </p>
        </div>
      )}

      {!defaults.fromRealData && (
        <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning-subtle px-4 py-3 text-sm text-warning">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>
            Ticket médio e taxas de conversão pré-preenchidos são um chute conservador documentado — ainda não há histórico
            suficiente de leads/contratos fechados no CRM pra sugerir valores reais. Ajuste os campos acima livremente.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {scenarios.map((scenario) => (
          <div
            key={scenario.label}
            className={cn(
              "flex flex-col gap-5 rounded-xl border p-5",
              scenario.label === "base" ? "border-brand-subtle-border bg-brand-subtle/40" : "border-border/60 bg-card/40"
            )}
          >
            <div className="flex flex-col gap-1">
              <span className={cn("text-sm font-medium", scenario.label === "base" && "text-brand")}>{SCENARIO_LABEL[scenario.label]}</span>
              <span className="text-xs text-muted-foreground">{SCENARIO_HINT[scenario.label]}</span>
            </div>

            <div className="flex flex-col gap-4">
              <ScenarioMetric icon={TrendingUp} label="Receita recorrente a conquistar" value={currencyFormatter.format(scenario.result.requiredRecurringRevenue)} />
              <ScenarioMetric icon={Users} label="Clientes necessários" value={String(scenario.result.clientsNeeded)} />
              <ScenarioMetric icon={Handshake} label="Propostas necessárias" value={String(scenario.result.proposalsNeeded)} />
              <ScenarioMetric icon={Target} label="Leads necessários" value={String(scenario.result.leadsNeeded)} />
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Cenário base: meta de {currencyFormatter.format(input.revenueGoal)} − MRR atual de {currencyFormatter.format(input.currentMrr)} ={" "}
        {currencyFormatter.format(base.result.requiredRecurringRevenue)} a conquistar, com ticket médio de {currencyFormatter.format(input.averageTicket)},
        conversão lead→proposta de {percentFormatter.format(input.leadToProposalRate)} e proposta→venda de {percentFormatter.format(input.proposalToSaleRate)} —
        precisa de {base.result.leadsNeeded} leads.
      </p>
    </div>
  );
}

function ScenarioMetric({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </div>
      <span className="text-xl font-semibold tabular-nums">{value}</span>
    </div>
  );
}
