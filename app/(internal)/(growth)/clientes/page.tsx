import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { listClientsOverview } from "@/lib/clientes/queries";
import { Button } from "@/components/ui/button";
import { ClientsMetricsStrip } from "@/components/clientes/clients-metrics-strip";
import { ClientsGrid } from "@/components/clientes/clients-grid";

export const metadata: Metadata = {
  title: "Clientes — Procreating",
  robots: { index: false, follow: false },
};

/**
 * Central de Clientes — redesenhada (era `ClientsTable`, tabela tradicional). Clicar num cliente
 * navega em tela cheia pra `/clientes/[id]` (era um drawer lateral que preservava a lista atrás;
 * trocado por pedido explícito — a rota `/clientes/[id]` já existia, nunca foi tocada). Dado
 * real, `listClientsOverview()` — nenhum mock; o pedido original citava conceitos de outro
 * domínio (link público, deploy status, assets) que pertencem ao admin do Client Hub/portfólio
 * da Pascoal (`/admin/clientes`, escopo de outra sessão), não a este ERP — a versão aqui foi
 * adaptada pro que o Procreating OS realmente modela (cliente → contrato → escopo/contato/
 * financeiro/evento), sem inventar estrutura nova.
 *
 * "Novo cliente" aponta pro Comercial (`/comercial`) em vez de abrir um form aqui — não existe
 * (e não foi criado) um jeito de cadastrar cliente direto neste ERP: todo cliente nasce de um
 * lead fechado (`close_lead_and_create_client`, RPC), nunca avulso. Um botão que fingisse criar
 * cliente do zero aqui pularia contrato/onboarding, quebrando esse invariante.
 */
export default async function ClientesPage() {
  const overview = await listClientsOverview();

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 pt-8 pb-16 lg:px-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl">Clientes</h1>
          <p className="max-w-lg text-sm text-muted-foreground">Gerencie clientes, contratos e a operação de cada um.</p>
        </div>
        <Button type="button" className="gap-1.5" asChild>
          <Link href="/comercial">
            <Plus className="size-4" />
            Novo cliente
          </Link>
        </Button>
      </div>

      <ClientsMetricsStrip overview={overview} />

      <ClientsGrid rows={overview.rows} />
    </main>
  );
}
