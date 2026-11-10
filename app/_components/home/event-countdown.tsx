"use client";

import { useEffect, useState } from "react";

import {
  computeCountdown,
  msUntilNextTick,
  padTwoDigits,
  parseEventStart,
  type Countdown,
} from "@/lib/countdown/compute-countdown";
import { countdownDigitFont } from "./countdown-digit-font";

type EventCountdownProps = {
  labels: { comingSoon: string; days: string; hours: string; minutes: string };
};

// Inlined at build time; ISO-8601, e.g. 2025-12-26T18:30:00+07:00.
const EVENT_START = process.env.NEXT_PUBLIC_EVENT_START_AT ?? "";
const START_MS = parseEventStart(EVENT_START);

// Before hydration we do not know "now"; render zeros without "Coming soon".
const INITIAL: Countdown = { days: 0, hours: 0, minutes: 0, upcoming: false };

function DigitTile({ digit }: { digit: string }) {
  // Figma Group 5: 51x82, radius 8, 0.5px #FFEA9E border, white→10% gradient at 50%.
  return (
    <span className="relative flex h-[82px] w-[51px] items-center justify-center">
      <span className="absolute inset-0 rounded-lg border-[0.5px] border-saa-accent bg-linear-to-b from-white to-white/10 opacity-50 backdrop-blur-[16.6px]" />
      <span className={`${countdownDigitFont.className} relative text-[49px] leading-none text-saa-text`}>
        {digit}
      </span>
    </span>
  );
}

function Unit({ value, label, testId }: { value: number; label: string; testId: string }) {
  const digits = padTwoDigits(value);
  return (
    <div className="flex flex-col gap-3.5">
      <span data-testid={testId} aria-label={digits} className="flex gap-[13px]">
        {[...digits].map((d, i) => (
          <DigitTile key={i} digit={d} />
        ))}
      </span>
      <span className="text-2xl font-bold leading-8 text-saa-text">{label}</span>
    </div>
  );
}

// B1: "Coming soon" + DAYS / HOURS / MINUTES, refreshed every minute.
export function EventCountdown({ labels }: EventCountdownProps) {
  const [countdown, setCountdown] = useState<Countdown>(INITIAL);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const tick = () => {
      const now = Date.now();
      const next = computeCountdown(START_MS, now);
      setCountdown(next);
      if (next.upcoming && START_MS !== null) timer = setTimeout(tick, msUntilNextTick(START_MS, now));
    };
    tick();
    return () => clearTimeout(timer);
  }, []);

  return (
    <div data-testid="event-countdown" data-event-start={EVENT_START} className="flex flex-col gap-4">
      {countdown.upcoming && <p className="text-2xl font-bold leading-8 text-saa-text">{labels.comingSoon}</p>}
      <div className="flex gap-10">
        <Unit value={countdown.days} label={labels.days} testId="countdown-days" />
        <Unit value={countdown.hours} label={labels.hours} testId="countdown-hours" />
        <Unit value={countdown.minutes} label={labels.minutes} testId="countdown-minutes" />
      </div>
    </div>
  );
}
