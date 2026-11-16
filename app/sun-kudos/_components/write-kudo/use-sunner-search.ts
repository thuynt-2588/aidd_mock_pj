"use client";

import { useEffect, useState } from "react";

import type { SunnerOption } from "@/lib/kudos/write-kudo";
import { searchSunnersAction } from "../../actions";

const DEBOUNCE_MS = 200;

/** Other Sunners matching `query` (debounced); `null` query = closed, no request. */
export function useSunnerSearch(query: string | null) {
  const [state, setState] = useState<{ key: string | null; results: SunnerOption[] }>({ key: null, results: [] });

  useEffect(() => {
    if (query === null) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      searchSunnersAction(query)
        .then((results) => !cancelled && setState({ key: query, results }))
        .catch(() => !cancelled && setState({ key: query, results: [] }));
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  // While a new query is pending, the previous results stay on screen.
  return { results: state.results, loading: query !== null && state.key !== query };
}
