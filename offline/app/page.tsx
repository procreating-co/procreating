import { redirect } from "next/navigation";

/** `http://localhost:<porta>/` abre direto a apresentação. */
export default function OfflineHome() {
  redirect("/clients/pascoal/public/past");
}
