import { redirect } from "next/navigation";

/** A antiga grade de módulos (`ModuleGrid`) só linkava pras 5 páginas que agora são as abas do
 *  `TopNav` deste grupo — redundante. `/operacao` sozinha leva direto pra primeira. */
export default function OperacaoPage() {
  redirect("/operacao/projetos");
}
