import type { Metadata } from "next";
import { listClients } from "@/lib/clientes/queries";
import { ClientsTable } from "@/components/clientes/clients-table";

export const metadata: Metadata = {
  title: "Clientes — Procreating",
  robots: { index: false, follow: false },
};

export default async function ClientesPage() {
  const clients = await listClients();

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 pt-8 pb-16 lg:px-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl">Clientes</h1>
        <p className="max-w-lg text-sm text-muted-foreground">Clientes conquistados — cadastro, contrato, financeiro e histórico de cada um.</p>
      </div>

      <ClientsTable clients={clients} />
    </main>
  );
}
