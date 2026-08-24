"use server";

import { redirect } from "next/navigation";
import { portalSignOut, PORTAL_LOGIN_PATH } from "@/lib/portal/auth";

export async function portalSignOutAction(): Promise<void> {
  await portalSignOut();
  redirect(PORTAL_LOGIN_PATH);
}
