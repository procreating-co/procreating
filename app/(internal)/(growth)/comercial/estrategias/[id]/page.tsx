import { redirect } from "next/navigation";

type Params = { id: string };

/**
 * §2/§4/§20 passo 5 — esta rota (página inteira, funil + cadência + edição) virou um drawer
 * (`StrategyDetailDrawer`) dentro de `/comercial`, aberto por `?strategyDetail=<id>`. Link salvo/
 * compartilhado da rota antiga continua funcionando — só redireciona, sem duplicar a busca de
 * dado (que agora mora em `app/(internal)/(growth)/comercial/page.tsx`, condicional a esse
 * parâmetro).
 */
export default async function EstrategiaDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  redirect(`/comercial?tab=commercial&strategyDetail=${id}`);
}
