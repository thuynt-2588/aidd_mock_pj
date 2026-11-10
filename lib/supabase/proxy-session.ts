import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { LOGIN_PATH } from "@/lib/auth/auth-routes";
import { getSupabaseEnv } from "./supabase-env";

// Routes that need a signed-in user. Everything else passes through after the
// session cookies have been refreshed.
const PROTECTED_PATHS = new Set(["/", "/awards-information"]);

const NO_STORE = "private, no-cache, no-store, must-revalidate, max-age=0";

/**
 * Refreshes the Supabase session on every matched request (Server Components
 * cannot write cookies, so expiring access tokens are rotated here) and sends
 * visitors without a user away from protected routes.
 */
export async function updateSupabaseSession(request: NextRequest): Promise<NextResponse> {
  const { url, anonKey } = getSupabaseEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        for (const [key, value] of Object.entries(headers ?? {})) {
          response.headers.set(key, value);
        }
      },
    },
  });

  // getUser() validates the token with the Auth server; never trust the raw cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && PROTECTED_PATHS.has(request.nextUrl.pathname)) {
    // Proxy responses need an absolute Location. Build it from the Host header
    // the browser sent so it stays on the same host (127.0.0.1): nextUrl.origin
    // can report "localhost", and session/locale cookies are per host.
    const host = request.headers.get("host") ?? request.nextUrl.host;
    const target = new URL(LOGIN_PATH, `${request.nextUrl.protocol}//${host}`);
    const redirect = NextResponse.redirect(target, 307);
    redirect.headers.set("Cache-Control", NO_STORE);
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    return redirect;
  }

  return response;
}
