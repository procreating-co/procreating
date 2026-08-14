import type { Metadata } from "next";
import { listStrategies } from "@/lib/comercial/queries";
import { StrategiesList } from "@/components/comercial/strategies-list";

export const metadata: Metadata = {
  title: "Estratégias — Procreating",
  robots: { index: false, follow: false },
};

export default async function EstrategiasPage() {
  const strategies = await listStrategies();

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 pt-8 pb-16 lg:px-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl">Estratégias</h1>
        <p className="max-w-lg text-sm text-muted-foreground">Campanhas comerciais — público-alvo, oferta, canal e metas de prospecção.</p>
      </div>

      <StrategiesList strategies={strategies} />
    </main>
  );
}
