"use client";

import { useState, useTransition } from "react";

import type { KudosFilters } from "@/lib/kudos/filters";
import { FEED_PAGE_SIZE, type KudoView } from "@/lib/kudos/kudos-types";
import type { KudosMessages } from "@/lib/i18n/kudos-messages";
import { loadMoreKudosAction } from "../actions";
import { KudoCard } from "./kudo-card";

type KudosFeedProps = { initial: KudoView[]; viewerId: string; filters: KudosFilters; t: KudosMessages };

// C.2: newest first, 5 at a time; "Xem thêm" loads the next 5 (no auto-load
// on scroll, so the page stays short). Keyed by the filters, so a filter
// change starts again from the first page.
export function KudosFeed({ initial, viewerId, filters, t }: KudosFeedProps) {
  const [items, setItems] = useState(initial);
  const [done, setDone] = useState(initial.length < FEED_PAGE_SIZE);
  const [loading, startLoading] = useTransition();

  const loadMore = () =>
    startLoading(async () => {
      try {
        const page = await loadMoreKudosAction(filters, items.length);
        setItems((prev) => {
          const seen = new Set(prev.map((k) => k.id));
          return [...prev, ...page.filter((k) => !seen.has(k.id))];
        });
        if (page.length < FEED_PAGE_SIZE) setDone(true);
      } catch {
        setDone(true);
      }
    });

  if (items.length === 0) {
    return <p className="py-10 text-center text-xl font-bold text-saa-text">{t.empty}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {items.map((kudo) => (
        <KudoCard key={kudo.id} kudo={kudo} variant="feed" viewerId={viewerId} filters={filters} t={t} />
      ))}
      {!done && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loading}
          className="mx-auto flex h-14 items-center justify-center rounded-full border border-saa-border bg-saa-accent-soft px-10 text-base font-bold leading-6 text-saa-text transition-colors hover:bg-saa-accent-selected disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-saa-accent"
        >
          {loading ? t.loading : t.seeMore}
        </button>
      )}
    </div>
  );
}
