"use server";

import { redirect } from "next/navigation";
import { portalSignIn } from "@/lib/portal/auth";

export type PortalSignInFormState = { error?: string } | undefined;

export async function portalSignInAction(_prevState: PortalSignInFormState, formData: FormData): Promise<PortalSignInFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const result = await portalSignIn(email, password);
  if (!result.ok) return { error: result.error };

  redirect(`/portal/${result.slug}`);
}
