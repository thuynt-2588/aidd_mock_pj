import type { NextRequest } from "next/server";

import { LOGIN_ERROR_PATH, POST_LOGIN_PATH } from "@/lib/auth/auth-routes";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

// OAuth return point: Supabase sends the browser here with `?code=...` after
// Google succeeds, or with `?error=...` when the user cancels or is denied.
// The code is exchanged for a session on the server only; the session cookies
// are written onto this response by the server client.

// Responses here may carry auth cookies and must never be cached.
const NO_STORE = "private, no-cache, no-store, must-revalidate, max-age=0";

// Redirects with a path-only Location so the browser stays on the host it
// called us on. `request.nextUrl.origin` reports `localhost` even when the dev
// server listens on 127.0.0.1, and cookies (session, PKCE verifier, locale)
// are per host, so an absolute URL built from it would drop the session.
// `path` is always one of our constants, never a query-supplied value.
function redirectTo(path: string): Response {
  return new Response(null, {
    status: 307,
    headers: { Location: path, "Cache-Control": NO_STORE },
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");

  if (searchParams.has("error") || !code) {
    return redirectTo(LOGIN_ERROR_PATH);
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("OAuth code exchange failed:", error.message);
      return redirectTo(LOGIN_ERROR_PATH);
    }
  } catch (cause) {
    console.error("OAuth callback failed:", cause);
    return redirectTo(LOGIN_ERROR_PATH);
  }

  return redirectTo(POST_LOGIN_PATH);
}
