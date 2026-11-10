import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseEnv } from "./supabase-env";

// Supabase client for Route Handlers, Server Functions and Server Components.
// Create one per request: it is bound to that request's cookie store.
export async function createServerSupabaseClient() {
  const { url, anonKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot write cookies during render, so `set`
          // throws there. Reads still work; the write is retried by the next
          // Route Handler or Server Function that touches the session.
          // The cache headers passed as setAll's 2nd argument cannot be set
          // through `cookies()`; callers that write a session apply no-store
          // on their own response (see app/auth/callback/route.ts).
        }
      },
    },
  });
}
