import type { Metadata } from "next";
import { computeSimulationDefaults } from "@/lib/simulation/defaults";
import { SimulatorForm } from "@/components/marketing/simulator-form";

export const metadata: Metadata = {
  title: "Simulador — Procreating",
  robots: { index: false, follow: false },
};

/**
 * Simulation Engine em tela — Entrada → Regras de negócio → Cálculo → Cenário → Resultado. O
 * cálculo em si vive em `lib/simulation/engine.ts` (puro, sem I/O); esta página só busca os
 * valores sugeridos (`computeSimulationDefaults`, server-only) e entrega pro form client-side
 * recalcular a cada digitação. Nenhum cenário é persistido nesta fase.
 */
export default async function SimuladoresPage() {
  const defaults = await computeSimulationDefaults();

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 py-16 lg:px-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl">Simulador</h1>
        <p className="max-w-lg text-sm text-muted-foreground">
          Quanto de lead, proposta e cliente é preciso pra bater uma meta de faturamento — três cenários lado a lado, recalculados a cada mudança.
        </p>
      </div>

      <SimulatorForm defaults={defaults} />
    </main>
  );
}
