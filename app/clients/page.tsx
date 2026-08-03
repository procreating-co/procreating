import type { Metadata } from "next";
import { ClientCommand } from "@/components/clients/client-command";
import { mockLauncherClients } from "@/lib/clients/launcher-mock-data";

export const metadata: Metadata = { title: "Clients | Procreating" };

/**
 * Launcher — ponto de entrada pra todos os projetos de cliente. Convive com
 * `app/clients/[client]/` (rota dinâmica, intocada) como irmã estática — `/clients` cai aqui,
 * `/clients/<slug>` cai lá, Next.js resolve os dois sem conflito.
 */
export default function ClientsLauncherPage() {
  return <ClientCommand clients={mockLauncherClients} />;
}
