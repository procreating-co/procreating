import { redirect } from "next/navigation";

/** A antiga grade de módulos (`ModuleGrid`) só linkava pras páginas que agora são as abas do
 *  `TopNav` deste grupo — redundante. `/operacao` sozinha redireciona — pedido explícito: pra
 *  `/clientes` agora (era `/operacao/projetos`; ver `NAV_GROUPS`/`OPERATIONS_TABS` em
 *  `nav-config.ts`, mudaram juntos). */
export default function OperacaoPage() {
  redirect("/clientes");
}
