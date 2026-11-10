import type { NextRequest } from "next/server";

import { updateSupabaseSession } from "@/lib/supabase/proxy-session";

export async function proxy(request: NextRequest) {
  return updateSupabaseSession(request);
}

export const config = {
  // Skip static assets, image optimisation and the OAuth callback (it writes
  // the session itself); run everywhere else so sessions stay fresh.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
