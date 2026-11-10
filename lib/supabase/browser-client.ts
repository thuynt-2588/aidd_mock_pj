import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseEnv } from "./supabase-env";

// Supabase client for Client Components. It keeps the session and the PKCE
// code verifier in cookies so the /auth/callback route can finish the flow.
export function createBrowserSupabaseClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient(url, anonKey);
}
