// Time left until the SAA event starts, in whole days / hours / minutes.

export type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  /** True while the start time is still in the future. */
  upcoming: boolean;
};

const MINUTE_MS = 60_000;
const ZERO: Countdown = { days: 0, hours: 0, minutes: 0, upcoming: false };

/** Parses an ISO-8601 datetime; returns null when missing or invalid. */
export function parseEventStart(value: string | undefined): number | null {
  if (!value) return null;
  const ms = Date.parse(value);
  return Number.isNaN(ms) ? null : ms;
}

/** Remaining time from `nowMs` to `startMs`; past, missing or invalid start → all zero. */
export function computeCountdown(startMs: number | null, nowMs: number): Countdown {
  if (startMs === null || startMs <= nowMs) return ZERO;
  const totalMinutes = Math.floor((startMs - nowMs) / MINUTE_MS);
  // Minute precision: the last partial minute already reads 00:00:00, which
  // the spec treats as "reached zero" (hide "Coming soon").
  if (totalMinutes === 0) return ZERO;
  return {
    days: Math.floor(totalMinutes / (24 * 60)),
    hours: Math.floor(totalMinutes / 60) % 24,
    minutes: totalMinutes % 60,
    upcoming: true,
  };
}

/** Always two digits ("04", "00"); values above 99 are shown as-is. */
export function padTwoDigits(value: number): string {
  return String(value).padStart(2, "0");
}

/**
 * Milliseconds until the displayed minute changes: just past the next
 * whole-minute boundary (exactly on it the floored value is unchanged).
 */
export function msUntilNextTick(startMs: number, nowMs: number): number {
  return ((startMs - nowMs) % MINUTE_MS) + 1;
}
