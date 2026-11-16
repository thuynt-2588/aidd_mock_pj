"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent, type PointerEvent } from "react";

import { formatKudoTime, formatTickerTime } from "@/lib/kudos/format";
import { kudoDetailPath } from "@/lib/kudos/filters";
import { SPOTLIGHT_NETWORK, SPOTLIGHT_TEXTURE } from "@/lib/kudos/kudos-assets";
import type { SpotlightData } from "@/lib/kudos/kudos-types";
import { layoutSpotlight } from "@/lib/kudos/spotlight-layout";
import type { KudosMessages } from "@/lib/i18n/kudos-messages";
import { PanZoomIcon, SearchIcon } from "./kudos-icons";

// Figma B.7: 1157x548 board, 1px #998C5F, radius 47; names 6.7–11.3px.
const W = 1157;
const H = 548;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const TICKER_OPACITY = [1, 0.7, 0.5, 0.3, 0.1];
// Names stay in the band between the header row and the live feed.
const CLOUD_TOP = 0.16;
const CLOUD_HEIGHT = 0.5;

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();

type SpotlightBoardProps = { data: SpotlightData; t: KudosMessages };

export function SpotlightBoard({ data, t }: SpotlightBoardProps) {
  const nodes = useMemo(
    () =>
      layoutSpotlight(
        data.people.map(({ profileId, name, kudosCount }) => ({ profileId, name, kudosCount })),
        { width: W, height: H * CLOUD_HEIGHT },
      ).map((n) => ({ ...n, y: n.y + H * CLOUD_TOP })),
    [data.people],
  );
  const byId = useMemo(() => new Map(data.people.map((p) => [p.profileId, p])), [data.people]);

  const [panZoom, setPanZoom] = useState(false);
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  const [query, setQuery] = useState("");
  const [matchId, setMatchId] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  // B.7.2: mouse-wheel zoom while Pan/Zoom is on (non-passive to stop page scroll).
  useEffect(() => {
    const board = boardRef.current;
    if (!board || !panZoom) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setView((v) => ({ ...v, scale: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.scale * (e.deltaY < 0 ? 1.1 : 0.9))) }));
    };
    board.addEventListener("wheel", onWheel, { passive: false });
    return () => board.removeEventListener("wheel", onWheel);
  }, [panZoom]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!panZoom) return;
    drag.current = { px: e.clientX, py: e.clientY, x: view.x, y: view.y };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const board = boardRef.current;
    if (!d || !board) return;
    const rect = board.getBoundingClientRect();
    setView((v) => ({ ...v, x: d.x + ((e.clientX - d.px) / rect.width) * 100, y: d.y + ((e.clientY - d.py) / rect.height) * 100 }));
  };
  const endDrag = () => {
    drag.current = null;
    setDragging(false);
  };

  // B.7.3: find a Sunner, highlight the name and bring it to the centre.
  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = normalize(query);
    const hit = q ? nodes.find((n) => normalize(n.name).includes(q)) : undefined;
    setMatchId(hit?.profileId ?? null);
    setNotFound(Boolean(q) && !hit);
    if (hit) {
      const scale = Math.max(view.scale, 1.5);
      setView({ scale, x: -(hit.x / W - 0.5) * 100 * scale, y: -(hit.y / H - 0.5) * 100 * scale });
    }
  };

  return (
    <div
      ref={boardRef}
      data-testid="spotlight-board"
      className="relative isolate mx-auto aspect-[1157/548] w-full max-w-[1157px] overflow-hidden rounded-[47px] border border-saa-border bg-saa-bg"
    >
      {/* Figma B.7: "Root further" artwork (pre-darkened), then the network
          lines layer (30% black + white lines, semi-transparent) on top. */}
      <Image src={SPOTLIGHT_TEXTURE} alt="" fill sizes="(min-width: 1157px) 1157px, 100vw" className="object-cover" />
      <Image src={SPOTLIGHT_NETWORK} alt="" fill sizes="(min-width: 1157px) 1157px, 100vw" className="object-cover" />

      {/* Word cloud (pans / zooms). */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={`absolute inset-0 origin-center ${panZoom ? "cursor-grab touch-none active:cursor-grabbing" : ""} ${dragging ? "" : "transition-transform duration-300"}`}
        style={{ transform: `translate(${view.x}%, ${view.y}%) scale(${view.scale})` }}
      >
        {nodes.length === 0 && (
          <p className="absolute inset-0 flex items-center justify-center text-xl font-bold text-saa-text">{t.noData}</p>
        )}
        {nodes.map((n) => {
          const person = byId.get(n.profileId)!;
          const match = n.profileId === matchId;
          return (
            <Link
              key={n.profileId}
              href={kudoDetailPath(person.latestKudoId)}
              draggable={false}
              className={`group absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-bold leading-none tracking-[0.2px] hover:z-10 focus-visible:outline-1 focus-visible:outline-saa-accent ${
                match ? "z-10 text-saa-spotlight-match" : "text-white hover:text-saa-accent"
              }`}
              style={{ left: `${(n.x / W) * 100}%`, top: `${(n.y / H) * 100}%`, fontSize: match ? n.fontSize * 1.6 : n.fontSize }}
            >
              <span data-match={match}>{n.name}</span>
              {/* Hover: name + time of the latest kudos received. */}
              <span className="pointer-events-none absolute left-1/2 top-full mt-1 hidden -translate-x-1/2 rounded bg-saa-container-2 px-2 py-1 text-[10px] font-bold text-saa-text shadow group-hover:block group-focus-visible:block">
                {n.name} · {formatKudoTime(person.lastReceivedAt)}
              </span>
            </Link>
          );
        })}
      </div>

      {/* B.7.1 total: centred at the top. */}
      <p className="pointer-events-none absolute inset-x-0 top-4 text-center text-2xl font-bold leading-[44px] text-white lg:text-4xl">
        {data.totalKudos} {t.spotlightKudos}
      </p>
      {/* B.7.3 search: top-left. */}
      <form role="search" onSubmit={onSearch} className="absolute left-6 top-6 flex h-[39px] w-[219px] items-center gap-1.5 rounded-full border-[0.68px] border-saa-border bg-saa-accent-soft px-3">
        <button type="submit" aria-label={t.spotlightSearch} className="text-saa-text">
          <SearchIcon className="size-4" />
        </button>
        <input
          type="search"
          value={query}
          maxLength={100}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.spotlightSearch}
          aria-label={t.spotlightSearch}
          className="min-w-0 flex-1 bg-transparent text-[11px] font-medium text-saa-text placeholder:text-saa-text/80 focus:outline-none"
        />
      </form>
      {/* B.7.2 pan/zoom: bottom-right. */}
      <button
        type="button"
        onClick={() => {
          setPanZoom((v) => !v);
          if (panZoom) setView({ x: 0, y: 0, scale: 1 });
        }}
        aria-pressed={panZoom}
        aria-label={t.spotlightPanZoom}
        title={t.spotlightPanZoom}
        className={`absolute bottom-10 right-10 flex size-[30px] items-center justify-center rounded text-saa-text transition-colors ${panZoom ? "bg-saa-accent-selected" : "hover:bg-saa-accent-soft"}`}
      >
        <PanZoomIcon />
      </button>
      {notFound && (
        <p role="status" className="absolute left-8 top-[72px] text-sm font-bold text-saa-spotlight-match">
          {t.spotlightNotFound}
        </p>
      )}

      {/* Live feed: newest first, fading out. */}
      <ul className="pointer-events-none absolute bottom-6 left-8 hidden flex-col gap-1 lg:left-12 lg:flex">
        {data.recent.map((r, i) => (
          <li key={r.id} style={{ opacity: TICKER_OPACITY[i] ?? 0.1 }} className="text-sm font-bold leading-5 tracking-[0.1px] text-white">
            {formatTickerTime(r.createdAt)} {r.receiverName} {t.spotlightReceived}
          </li>
        ))}
      </ul>
    </div>
  );
}
