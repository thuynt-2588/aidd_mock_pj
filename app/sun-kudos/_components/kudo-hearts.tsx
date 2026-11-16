"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { setKudoHeartAction } from "../actions";
import { useToast } from "./kudos-toast";

// C.4.1 "Thả tim": one heart state per kudos for the whole board. The same
// kudos can be on screen twice (Highlight carousel + All Kudos), so the state
// lives here, keyed by kudos id, instead of in each card. A kudos nobody has
// touched yet shows the server's numbers from its props.

export type HeartState = { hearted: boolean; count: number; pending: boolean };

type HeartsContext = {
  hearts: Record<string, HeartState>;
  write: (kudoId: string, state: HeartState) => void;
};

const Hearts = createContext<HeartsContext | null>(null);

export function KudoHeartsProvider({ children }: { children: ReactNode }) {
  const [hearts, setHearts] = useState<Record<string, HeartState>>({});
  const write = useCallback((kudoId: string, state: HeartState) => {
    setHearts((all) => ({ ...all, [kudoId]: state }));
  }, []);
  const value = useMemo(() => ({ hearts, write }), [hearts, write]);
  return <Hearts.Provider value={value}>{children}</Hearts.Provider>;
}

/**
 * The heart of one kudos and its toggle: optimistic (count and colour change
 * at once), disabled while saving, then the server's numbers. If saving fails
 * the change is undone and `failedText` is shown as a toast.
 */
export function useKudoHeart(kudoId: string, initial: { hearted: boolean; count: number }, failedText: string) {
  const shared = useContext(Hearts);
  const toast = useToast();
  // Without a provider (a card rendered on its own) the state stays in the card.
  const [own, setOwn] = useState<HeartState | null>(null);

  const saved = shared ? shared.hearts[kudoId] : own;
  const state: HeartState = saved ?? { ...initial, pending: false };
  const write = shared ? (next: HeartState) => shared.write(kudoId, next) : setOwn;

  const toggle = async () => {
    if (state.pending) return;
    const previous = state;
    const wanted = !previous.hearted;
    write({ hearted: wanted, count: previous.count + (wanted ? 1 : -1), pending: true });
    try {
      const result = await setKudoHeartAction(kudoId, wanted);
      write({ hearted: result.hearted, count: result.heartCount, pending: false });
    } catch {
      write({ ...previous, pending: false });
      toast(failedText);
    }
  };

  return { ...state, toggle };
}
