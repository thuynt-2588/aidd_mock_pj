import { redirect } from "next/navigation";
import { cache } from "react";
import type { User } from "@supabase/supabase-js";

import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { LOGIN_PATH } from "./auth-routes";

/**
 * Returns the signed-in user or redirects to /login. The proxy already guards
 * protected routes; this is the page-level check the Next docs require so a
 * proxy matcher mistake can never expose the page. Memoised per request.
 */
export const requireCurrentUser = cache(async (): Promise<User> => {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(LOGIN_PATH);
  return user;
});
