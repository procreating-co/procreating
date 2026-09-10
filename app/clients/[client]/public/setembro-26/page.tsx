import { redirect } from "next/navigation";

/**
 * A apresentação de setembro/26 virou a própria Home (`/clients/<slug>/public`) — este link
 * antigo (já compartilhado com o cliente) segue funcionando via redirect permanente, sem manter
 * uma segunda cópia da página.
 */
export default async function ClientSetembro26Redirect({ params }: { params: Promise<{ client: string }> }) {
  const { client } = await params;
  redirect(`/clients/${client}/public`);
}
