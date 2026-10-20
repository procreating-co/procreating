import { redirect } from "next/navigation";

/**
 * Online, `/clients/pascoal/public` é a apresentação de setembro. Offline, a "home" é a
 * apresentação do Projeto Inicial — é pra cá que o logo do menu e o botão "Home" da galeria levam.
 */
export default function OfflinePublicHome() {
  redirect("/clients/pascoal/public/past");
}
