"use client";

import { useState } from "react";

import type { KudosFilters } from "@/lib/kudos/filters";
import type { KudoView } from "@/lib/kudos/kudos-types";
import type { KudosMessages } from "@/lib/i18n/kudos-messages";
import { KudoCard } from "./kudo-card";
import { ChevronLeftIcon, ChevronRightIcon } from "./kudos-icons";

type HighlightCarouselProps = { kudos: KudoView[]; viewerId: string; filters: KudosFilters; t: KudosMessages };

const CARD = 528;
const GAP = 24;

const ARROW =
  "flex items-center justify-center rounded text-saa-text transition-colors hover:bg-saa-accent-soft disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent focus-visible:outline-2 focus-visible:outline-saa-accent";

// B.2 / B.5: the current card is centred and fully visible, its neighbours
// fade into the page (Figma: 400px #00101A gradients with 80px arrows).
// Arrows are disabled at both ends; the pager shows "2/5". The parent keys
// this component by the active filters, so a filter change resets it to 1.
export function HighlightCarousel({ kudos, viewerId, filters, t }: HighlightCarouselProps) {
  const [index, setIndex] = useState(0);
  const total = kudos.length;

  if (total === 0) {
    return <p className="px-6 text-center text-xl font-bold text-saa-text lg:px-36">{t.empty}</p>;
  }

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(total - 1, i + 1));
  const atStart = index === 0;
  const atEnd = index === total - 1;

  return (
    <div className="flex flex-col gap-10">
      {/* B.2 / B.2.3: 1440 x 525, cards centred vertically; the 533px card overflows 4px top/bottom (clip x only). */}
      <div data-testid="highlight-viewport" className="relative h-[525px] w-full overflow-x-clip">
        <div
          className="absolute inset-y-0 left-1/2 flex items-center transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={{ gap: GAP, transform: `translateX(${-(index * (CARD + GAP) + CARD / 2)}px)` }}
        >
          {/* Side cards are not faded themselves; the gradients below cover them. */}
          {kudos.map((kudo, i) => (
            <div key={kudo.id} inert={i !== index} aria-hidden={i !== index}>
              <KudoCard kudo={kudo} variant="highlight" viewerId={viewerId} filters={filters} t={t} />
            </div>
          ))}
        </div>
        {/* B.2.1 in Frame 528 (padding-left 80) / B.2.2 in Frame 527 (padding 80 / 40, centred). 60px icons. */}
        <div className="pointer-events-none absolute -inset-y-1 left-0 hidden w-[400px] items-center bg-[linear-gradient(90deg,#00101a_50%,rgba(255,255,255,0)_100%)] pl-20 lg:flex">
          <button type="button" onClick={prev} disabled={atStart} aria-label={t.prev} className={`${ARROW} pointer-events-auto size-20`}>
            <ChevronLeftIcon className="size-[60px]" />
          </button>
        </div>
        <div className="pointer-events-none absolute -inset-y-1 right-0 hidden w-[400px] items-center justify-center bg-[linear-gradient(270deg,#00101a_50%,rgba(255,255,255,0)_100%)] pl-20 pr-10 lg:flex">
          <button type="button" onClick={next} disabled={atEnd} aria-label={t.next} className={`${ARROW} pointer-events-auto size-20`}>
            <ChevronRightIcon className="size-[60px]" />
          </button>
        </div>
      </div>
      {/* B.5 */}
      <div className="flex items-center justify-center gap-8">
        <button type="button" onClick={prev} disabled={atStart} aria-label={t.prev} className={`${ARROW} size-12`}>
          <ChevronLeftIcon />
        </button>
        {/* B.5.2: current page 40px bold #FFEA9E; "/total" 24px semibold #999 (≈1.6x smaller, as in the design); same baseline. */}
        <span data-testid="highlight-pager" aria-live="polite" className="flex items-baseline text-2xl font-semibold leading-8 text-saa-muted">
          <span data-testid="highlight-pager-current" className="text-[40px] font-bold leading-[48px] text-saa-accent">
            {index + 1}
          </span>
          /{total}
        </span>
        <button type="button" onClick={next} disabled={atEnd} aria-label={t.next} className={`${ARROW} size-12`}>
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
}
