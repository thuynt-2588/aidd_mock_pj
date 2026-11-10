"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";

import { navLinkClass } from "@/app/_components/home/home-nav-items";
import { findActiveSlug, slugFromHash } from "@/lib/awards/active-section";
import { AWARD_SCROLL_OFFSET } from "./award-scroll-offset";
import { ICON_TARGET, MaskIcon } from "./mask-icon";

type MenuItem = { slug: string; title: string };
type AwardsMenuProps = { label: string; items: MenuItem[] };

// A section counts as "reached" a little before it hits the scroll target.
const SPY_OFFSET = AWARD_SCROLL_OFFSET + 16;

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// C: category menu. Click → smooth scroll to the award (D.x) and mark it
// active; while reading, the active item follows the scroll position.
export function AwardsMenu({ label, items }: AwardsMenuProps) {
  const slugs = useMemo(() => items.map((item) => item.slug), [items]);
  const [active, setActive] = useState(slugs[0]);
  // Target of a click / #hash: keep it active until the scroll reaches it, so
  // the menu does not flicker through the sections passed on the way.
  const lockRef = useRef<string | null>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const tops = slugs.flatMap((slug) => {
        const el = document.getElementById(slug);
        return el ? [{ slug, top: el.getBoundingClientRect().top }] : [];
      });
      const spied = findActiveSlug(tops, SPY_OFFSET);
      const locked = lockRef.current;
      if (locked && locked === spied) lockRef.current = null;
      setActive(locked ?? spied ?? slugs[0]);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const followHash = () => {
      lockRef.current = slugFromHash(window.location.hash, slugs);
      schedule();
    };
    // The reader took over the scroll: stop holding the clicked target.
    const release = () => {
      lockRef.current = null;
    };

    followHash();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("hashchange", followHash);
    window.addEventListener("wheel", release, { passive: true });
    window.addEventListener("touchstart", release, { passive: true });
    window.addEventListener("keydown", release);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("hashchange", followHash);
      window.removeEventListener("wheel", release);
      window.removeEventListener("touchstart", release);
      window.removeEventListener("keydown", release);
    };
  }, [slugs]);

  const onSelect = (event: MouseEvent<HTMLAnchorElement>, slug: string) => {
    const target = document.getElementById(slug);
    if (!target) return;
    event.preventDefault();
    lockRef.current = slug;
    setActive(slug);
    target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    window.history.pushState(null, "", `#${slug}`);
  };

  return (
    <nav aria-label={label} className="shrink-0 lg:sticky lg:top-[104px] lg:w-[178px]">
      <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-4">
        {items.map(({ slug, title }) => {
          const selected = slug === active;
          return (
            <li key={slug}>
              <a
                href={`#${slug}`}
                onClick={(event) => onSelect(event, slug)}
                aria-current={selected ? "location" : undefined}
                className={`${navLinkClass(selected)} inline-flex items-center gap-1 text-sm leading-5 tracking-[0.25px]`}
              >
                <MaskIcon src={ICON_TARGET} />
                {/* Figma wraps "Top Project Leader" / "Signature 2025 - Creator" onto two lines. */}
                <span className="max-w-[118px]">{title}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
