"use server";

import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { LOGIN_PATH } from "./auth-routes";

/** Ends this browser's session (other devices stay signed in) and returns to /login. */
export async function signOutAction(): Promise<void> {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) console.error("Sign-out failed:", error.message);
  } catch (cause) {
    console.error("Sign-out failed:", cause);
  }
  redirect(LOGIN_PATH);
}
