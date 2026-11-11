"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { countdownDigitFont } from "@/app/_components/home/countdown-digit-font";
import { computeCountdown, padTwoDigits, parseEventStart, type Countdown } from "@/lib/countdown/compute-countdown";
import { isSiteOpen, PRELAUNCH_DONE_PATH } from "@/lib/countdown/prelaunch-gate";
import type { PrelaunchMessages } from "@/lib/i18n/prelaunch-messages";

// Website opening time (not the event start); inlined at build time.
// ISO-8601, e.g. 2026-12-01T09:00:00+07:00.
const SITE_OPEN_AT = process.env.NEXT_PUBLIC_SITE_OPEN_AT ?? "";
const OPEN_MS = parseEventStart(SITE_OPEN_AT);
const TICK_MS = 1_000;

// Before hydration we do not know "now"; render zeros (spec default "00").
const INITIAL: Countdown = { days: 0, hours: 0, minutes: 0, upcoming: false };

function DigitTile({ digit }: { digit: string }) {
  // Figma component 186:2619 at 1.5x: 76.8x122.88, radius 12, 0.75px #FFEA9E
  // border, white → 10% white gradient at 50% opacity, 24.96px backdrop blur.
  return (
    <span className="relative flex h-[123px] w-[77px] items-center justify-center">
      <span className="absolute inset-0 rounded-xl border-[0.75px] border-saa-accent bg-linear-to-b from-white to-white/10 opacity-50 backdrop-blur-[25px]" />
      <span className={`${countdownDigitFont.className} relative text-[73.7px] leading-none text-saa-text`}>{digit}</span>
    </span>
  );
}

function Unit({ value, label, name }: { value: number; label: string; name: string }) {
  const digits = padTwoDigits(value);
  return (
    <div className="flex flex-col items-start gap-[21px]">
      <span data-testid={`prelaunch-${name}`} aria-label={digits} className="flex gap-[21px]">
        {[...digits].map((d, i) => (
          <DigitTile key={i} digit={d} />
        ))}
      </span>
      <span className="text-4xl font-bold leading-12 text-saa-text">{label}</span>
    </div>
  );
}

// Items 1–3: DAYS / HOURS / MINUTES, refreshed every second. At zero the
// navigation lock ends, so the page moves on to the homepage.
export function PrelaunchCountdown({ units }: { units: PrelaunchMessages["units"] }) {
  const router = useRouter();
  const [countdown, setCountdown] = useState<Countdown>(INITIAL);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      setCountdown(computeCountdown(OPEN_MS, now));
      if (isSiteOpen(OPEN_MS, now)) {
        clearInterval(timer);
        router.replace(PRELAUNCH_DONE_PATH);
      }
    };
    const timer = setInterval(tick, TICK_MS);
    tick();
    return () => clearInterval(timer);
  }, [router]);

  return (
    <div
      data-testid="prelaunch-countdown"
      data-open-at={SITE_OPEN_AT}
      role="timer"
      className="flex flex-wrap items-center justify-center gap-[60px]"
    >
      <Unit value={countdown.days} label={units.days} name="days" />
      <Unit value={countdown.hours} label={units.hours} name="hours" />
      <Unit value={countdown.minutes} label={units.minutes} name="minutes" />
    </div>
  );
}
