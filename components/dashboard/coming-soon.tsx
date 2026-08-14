import type { LucideIcon } from "lucide-react";
import { Construction } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";

/**
 * Rota sem conteúdo real ainda — nunca 404, nunca um card fingindo estar pronto. Mesma
 * linguagem visual do `EmptyState` (Fase B, redesign), só com um texto padrão de "isto ainda não
 * existe" em vez de uma ação. Usado em toda rota do esqueleto de navegação que só existe pra
 * navegação estar completa (visão de destino do produto, não desta fase).
 */
export function ComingSoon({
  title,
  description = "Essa área ainda não foi construída — faz parte da visão de longo prazo do produto, não desta fase.",
  icon: Icon = Construction,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
}) {
  return (
    <main className="mx-auto flex max-w-[1400px] flex-col px-6 py-16 lg:px-10">
      <EmptyState icon={Icon} title={title} description={description} />
    </main>
  );
}
