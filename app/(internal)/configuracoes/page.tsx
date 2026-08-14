import { redirect } from "next/navigation";

/** `/configuracoes` sozinha não tinha conteúdo — leva direto pra primeira aba. */
export default function ConfiguracoesPage() {
  redirect("/configuracoes/empresa");
}
