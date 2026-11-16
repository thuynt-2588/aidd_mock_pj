import Image from "next/image";
import { useId } from "react";

import type { HeroBadge } from "@/lib/kudos/format";
import { HERO_BADGE_IMAGES } from "@/lib/kudos/kudos-assets";

// MM_MEDIA_*Hero: the exported artwork already holds the title, colours and
// border (2x files), shown at 109x19 on cards and 218x38 in the hover card.

/** The badge image at 1x (cards) or 2x (hover). */
export function HeroBadgePill({ badge, scale = 1, testId, decorative = false }: { badge: HeroBadge; scale?: 1 | 2; testId: string; decorative?: boolean }) {
  const width = 109 * scale;
  const height = 19 * scale;
  return (
    <Image
      data-testid={testId}
      src={HERO_BADGE_IMAGES[badge]}
      alt={decorative ? "" : badge}
      width={width}
      height={height}
      className="block shrink-0 object-fill"
      style={{ width, height }}
    />
  );
}

/** Badge with its hover / focus card: 2x badge, tier title, description. */
export function HeroBadgeWithHover({ badge, hover }: { badge: HeroBadge; hover: { title: string; text: string } }) {
  const id = useId();
  return (
    <span className="group relative flex shrink-0">
      <span tabIndex={0} aria-describedby={id} className="flex rounded-[48px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saa-accent">
        <HeroBadgePill badge={badge} testId="hero-badge" />
      </span>
      <span
        role="tooltip"
        id={id}
        className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 hidden w-[300px] -translate-x-1/2 flex-col gap-3 rounded-xl bg-saa-bg p-4 text-left shadow-[0_8px_24px_rgba(0,0,0,0.4)] group-focus-within:flex group-hover:flex"
      >
        <HeroBadgePill badge={badge} scale={2} testId="hero-badge-large" decorative />
        <span className="flex flex-col">
          <span data-testid="hero-tooltip-title" className="text-base font-bold leading-6 text-white">
            {hover.title}
          </span>
          <span data-testid="hero-tooltip-text" className="text-base font-bold leading-6 text-saa-muted">
            {hover.text}
          </span>
        </span>
      </span>
    </span>
  );
}
