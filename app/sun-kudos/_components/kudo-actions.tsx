"use client";

import Link from "next/link";

import { formatHeartCount } from "@/lib/kudos/format";
import { kudoDetailPath } from "@/lib/kudos/filters";
import type { KudosMessages } from "@/lib/i18n/kudos-messages";
import { ArrowUpRightIcon, HeartIcon, LinkIcon } from "./kudos-icons";
import { useKudoHeart } from "./kudo-hearts";
import { useToast } from "./kudos-toast";

type KudoActionsProps = {
  kudoId: string;
  heartCount: number;
  heartedByMe: boolean;
  /** The viewer sent this kudos: the heart is disabled (C.4.1). */
  isOwn: boolean;
  showDetail: boolean;
  t: Pick<
    KudosMessages,
    "copyLink" | "viewDetail" | "linkCopied" | "heartLabel" | "ownKudosHeart" | "heartFailed"
  >;
};

const TEXT_BUTTON =
  "flex h-14 items-center gap-1 rounded p-4 text-base font-bold leading-6 tracking-[0.15px] text-saa-bg transition-colors hover:bg-saa-accent-selected focus-visible:outline-2 focus-visible:outline-saa-bg";

// B.4.4 / C.4 action row.
export function KudoActions({
  kudoId,
  heartCount,
  heartedByMe,
  isOwn,
  showDetail,
  t,
}: KudoActionsProps) {
  const toast = useToast();
  // Shared with every other card of this kudos on the board (kudo-hearts.tsx).
  const heart = useKudoHeart(kudoId, { hearted: heartedByMe, count: heartCount }, t.heartFailed);

  const copyLink = async () => {
    const url = `${window.location.origin}${kudoDetailPath(kudoId)}`;
    try {
      await navigator.clipboard.writeText(url);
      toast(t.linkCopied);
    } catch {
      // Clipboard blocked (permissions / insecure context): nothing copied, no toast.
    }
  };

  const copyButton = (
    <button type="button" onClick={copyLink} className={TEXT_BUTTON}>
      {t.copyLink}
      <LinkIcon />
    </button>
  );
  const heartButton = (
    <button
      type="button"
      onClick={heart.toggle}
      disabled={isOwn || heart.pending}
      aria-pressed={heart.hearted}
      aria-label={`${t.heartLabel}: ${heart.count}`}
      title={isOwn ? t.ownKudosHeart : undefined}
      className="flex items-center gap-1 rounded text-2xl font-bold leading-8 text-saa-bg disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-saa-bg"
    >
      <span>{formatHeartCount(heart.count)}</span>
      <span
        className={`flex ${heart.hearted ? "text-saa-badge" : "text-saa-muted"}`}
      >
        <HeartIcon filled={heart.hearted} />
      </span>
    </button>
  );

  // B.4.4 (highlight): hearts left · Copy Link middle · Xem chi tiết right.
  if (showDetail) {
    return (
      <div className="flex items-center justify-between gap-2">
        {heartButton}
        {copyButton}
        <Link href={kudoDetailPath(kudoId)} className={TEXT_BUTTON}>
          {t.viewDetail}
          <ArrowUpRightIcon />
        </Link>
      </div>
    );
  }
  // C.4 (feed): hearts left · Copy Link right.
  return (
    <div className="flex items-center justify-between gap-6">
      {heartButton}
      {copyButton}
    </div>
  );
}
