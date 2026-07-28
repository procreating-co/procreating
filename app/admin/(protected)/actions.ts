"use server";

import { redirect } from "next/navigation";
import { signOut, ADMIN_LOGIN_PATH } from "@/lib/admin/auth";

export async function signOutAction() {
  await signOut();
  redirect(ADMIN_LOGIN_PATH);
}
