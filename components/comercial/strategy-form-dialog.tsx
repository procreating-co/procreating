"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createStrategyAction, updateStrategyAction } from "@/lib/comercial/actions";
import type { Strategy, StrategyInput } from "@/lib/comercial/types";

const EMPTY_INPUT: StrategyInput = {
  name: "",
  targetAudience: "",
  segment: "",
  location: "",
  icp: "",
  qualificationCriteria: "",
  offer: "",
  salesPitch: "",
  prospectingChannel: "",
  prospectingGoal: null,
  meetingsGoal: null,
  closingGoal: null,
  revenueGoal: null,
};

function toInput(strategy: Strategy): StrategyInput {
  return {
    name: strategy.name,
    targetAudience: strategy.target_audience ?? "",
    segment: strategy.segment ?? "",
    location: strategy.location ?? "",
    icp: strategy.icp ?? "",
    qualificationCriteria: strategy.qualification_criteria ?? "",
    offer: strategy.offer ?? "",
    salesPitch: strategy.sales_pitch ?? "",
    prospectingChannel: strategy.prospecting_channel ?? "",
    prospectingGoal: strategy.prospecting_goal,
    meetingsGoal: strategy.meetings_goal,
    closingGoal: strategy.closing_goal,
    revenueGoal: strategy.revenue_goal,
  };
}

function numberField(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function StrategyFormDialog({
  open,
  onOpenChange,
  strategy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  strategy?: Strategy;
}) {
  const router = useRouter();
  const [input, setInput] = useState<StrategyInput>(EMPTY_INPUT);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isEditing = Boolean(strategy);

  useEffect(() => {
    if (!open) return;
    setInput(strategy ? toInput(strategy) : EMPTY_INPUT);
    setError(null);
  }, [open, strategy]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = strategy ? await updateStrategyAction(strategy.id, input) : await createStrategyAction(input);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit} className="flex max-h-[80vh] flex-col gap-6 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar estratégia" : "Nova estratégia"}</DialogTitle>
            <DialogDescription>Público-alvo, oferta e metas — o que orienta a prospecção dessa campanha.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="strategy-name">Nome</Label>
              <Input id="strategy-name" value={input.name} onChange={(e) => setInput((p) => ({ ...p, name: e.target.value }))} required autoFocus />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="strategy-target">Público-alvo</Label>
              <Input id="strategy-target" value={input.targetAudience} onChange={(e) => setInput((p) => ({ ...p, targetAudience: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="strategy-segment">Segmento</Label>
              <Input id="strategy-segment" value={input.segment} onChange={(e) => setInput((p) => ({ ...p, segment: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="strategy-location">Localização</Label>
              <Input id="strategy-location" value={input.location} onChange={(e) => setInput((p) => ({ ...p, location: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="strategy-channel">Canal de prospecção</Label>
              <Input id="strategy-channel" value={input.prospectingChannel} onChange={(e) => setInput((p) => ({ ...p, prospectingChannel: e.target.value }))} placeholder="WhatsApp, indicação, tráfego pago..." />
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="strategy-icp">Perfil ideal de cliente (ICP)</Label>
              <textarea
                id="strategy-icp"
                value={input.icp}
                onChange={(e) => setInput((p) => ({ ...p, icp: e.target.value }))}
                rows={2}
                className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="strategy-criteria">Critérios de qualificação</Label>
              <textarea
                id="strategy-criteria"
                value={input.qualificationCriteria}
                onChange={(e) => setInput((p) => ({ ...p, qualificationCriteria: e.target.value }))}
                rows={2}
                className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="strategy-offer">Oferta</Label>
              <textarea
                id="strategy-offer"
                value={input.offer}
                onChange={(e) => setInput((p) => ({ ...p, offer: e.target.value }))}
                rows={2}
                className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="strategy-pitch">Argumentos comerciais</Label>
              <textarea
                id="strategy-pitch"
                value={input.salesPitch}
                onChange={(e) => setInput((p) => ({ ...p, salesPitch: e.target.value }))}
                rows={2}
                className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="strategy-prospecting-goal">Meta de prospecção</Label>
              <Input
                id="strategy-prospecting-goal"
                type="number"
                inputMode="numeric"
                value={input.prospectingGoal ?? ""}
                onChange={(e) => setInput((p) => ({ ...p, prospectingGoal: numberField(e.target.value) }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="strategy-meetings-goal">Meta de reuniões</Label>
              <Input
                id="strategy-meetings-goal"
                type="number"
                inputMode="numeric"
                value={input.meetingsGoal ?? ""}
                onChange={(e) => setInput((p) => ({ ...p, meetingsGoal: numberField(e.target.value) }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="strategy-closing-goal">Meta de fechamento</Label>
              <Input
                id="strategy-closing-goal"
                type="number"
                inputMode="numeric"
                value={input.closingGoal ?? ""}
                onChange={(e) => setInput((p) => ({ ...p, closingGoal: numberField(e.target.value) }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="strategy-revenue-goal">Meta financeira (R$)</Label>
              <Input
                id="strategy-revenue-goal"
                type="number"
                inputMode="decimal"
                value={input.revenueGoal ?? ""}
                onChange={(e) => setInput((p) => ({ ...p, revenueGoal: numberField(e.target.value) }))}
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : isEditing ? "Salvar" : "Criar estratégia"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
