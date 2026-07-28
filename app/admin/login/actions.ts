"use server";

import { redirect } from "next/navigation";
import { signIn, ADMIN_HOME_PATH } from "@/lib/admin/auth";

export type SignInFormState = { error?: string } | undefined;

export async function signInAction(_prevState: SignInFormState, formData: FormData): Promise<SignInFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const result = await signIn(email, password);
  if (!result.ok) return { error: result.error };

  redirect(ADMIN_HOME_PATH);
}
