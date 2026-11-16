"use client";

import { useEffect, useRef, useState } from "react";

import type { KudosFilters } from "@/lib/kudos/filters";
import { FEED_PAGE_SIZE, type KudoView } from "@/lib/kudos/kudos-types";
import type { KudosMessages } from "@/lib/i18n/kudos-messages";
import { loadMoreKudosAction } from "../actions";
import { KudoCard } from "./kudo-card";

type KudosFeedProps = { initial: KudoView[]; viewerId: string; filters: KudosFilters; t: KudosMessages };

// C.2: newest first, 10 at a time; the next page loads when the sentinel at
// the bottom comes into view (infinite scroll). Keyed by the filters, so a
// filter change starts again from the first page.
export function KudosFeed({ initial, viewerId, filters, t }: KudosFeedProps) {
  const [items, setItems] = useState(initial);
  const [done, setDone] = useState(initial.length < FEED_PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const busy = useRef(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || done) return;
    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting || busy.current) return;
        busy.current = true;
        setLoading(true);
        try {
          const page = await loadMoreKudosAction(filters, items.length);
          setItems((prev) => {
            const seen = new Set(prev.map((k) => k.id));
            return [...prev, ...page.filter((k) => !seen.has(k.id))];
          });
          if (page.length < FEED_PAGE_SIZE) setDone(true);
        } catch {
          setDone(true);
        } finally {
          busy.current = false;
          setLoading(false);
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [done, filters, items.length]);

  if (items.length === 0) {
    return <p className="py-10 text-center text-xl font-bold text-saa-text">{t.empty}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {items.map((kudo) => (
        <KudoCard key={kudo.id} kudo={kudo} variant="feed" viewerId={viewerId} filters={filters} t={t} />
      ))}
      <div ref={sentinelRef} data-testid="kudos-feed-end" className="h-px" />
      {loading && <p className="text-center text-base font-bold text-saa-muted">{t.loading}</p>}
    </div>
  );
}
