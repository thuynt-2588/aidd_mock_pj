import type { NextRequest } from "next/server";

import { prelaunchGateResponse } from "@/lib/countdown/prelaunch-proxy";
import { updateSupabaseSession } from "@/lib/supabase/proxy-session";

export async function proxy(request: NextRequest) {
  // Prelaunch lock first: while it applies, nothing else on the site renders.
  return prelaunchGateResponse(request) ?? updateSupabaseSession(request);
}

export const config = {
  // Skip static assets, image optimisation and the OAuth callback (it writes
  // the session itself); run everywhere else so sessions stay fresh.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
