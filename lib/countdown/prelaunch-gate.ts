// Prelaunch lock (MoMorph 8PJQswPZmU): before the SAA website opens, every
// page redirects to the countdown; at the opening time navigation unlocks.
// The opening time (NEXT_PUBLIC_SITE_OPEN_AT) is separate from the event
// start shown on the homepage (NEXT_PUBLIC_EVENT_START_AT).

export const PRELAUNCH_PATH = "/prelaunch";
export const PRELAUNCH_DONE_PATH = "/";

/** Exact-time check (not minute precision); a missing opening time counts as open. */
export function isSiteOpen(openMs: number | null, nowMs: number): boolean {
  return openMs === null || nowMs >= openMs;
}

type GateState = { openMs: number | null; nowMs: number };

/** Where `pathname` must be redirected to, or null to let the request through. */
export function prelaunchRedirectTarget(pathname: string, { openMs, nowMs }: GateState): string | null {
  const open = isSiteOpen(openMs, nowMs);
  if (pathname === PRELAUNCH_PATH) return open ? PRELAUNCH_DONE_PATH : null;
  return open ? null : PRELAUNCH_PATH;
}
