import { NextResponse, type NextRequest } from "next/server";

import { parseEventStart } from "./compute-countdown";
import { prelaunchRedirectTarget } from "./prelaunch-gate";

const NO_STORE = "private, no-cache, no-store, must-revalidate, max-age=0";

/**
 * Proxy step for the prelaunch countdown: returns a redirect when the request
 * must go to (or leave) /prelaunch, otherwise null.
 */
export function prelaunchGateResponse(request: NextRequest, nowMs: number = Date.now()): NextResponse | null {
  const target = prelaunchRedirectTarget(request.nextUrl.pathname, {
    openMs: parseEventStart(process.env.NEXT_PUBLIC_SITE_OPEN_AT),
    nowMs,
  });
  if (!target) return null;

  // Same host the browser used (see proxy-session.ts): cookies are per host.
  const host = request.headers.get("host") ?? request.nextUrl.host;
  const redirect = NextResponse.redirect(new URL(target, `${request.nextUrl.protocol}//${host}`), 307);
  redirect.headers.set("Cache-Control", NO_STORE);
  return redirect;
}
