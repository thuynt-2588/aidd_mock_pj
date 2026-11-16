import Image from "next/image";
import Link from "next/link";

import { formatKudoTime, truncateHashtags } from "@/lib/kudos/format";
import { kudoDetailPath, kudosFilterHref, type KudosFilters } from "@/lib/kudos/filters";
import type { KudoView } from "@/lib/kudos/kudos-types";
import type { KudosMessages } from "@/lib/i18n/kudos-messages";
import { KudoActions } from "./kudo-actions";
import { KudoContent } from "./kudo-content";
import { richTextFont } from "./write-kudo/rich-text-font";
import { PenIcon, SendIcon } from "./kudos-icons";
import { KudoPersonInfo } from "./kudo-person";

type KudoCardProps = {
  kudo: KudoView;
  variant: "highlight" | "feed";
  viewerId: string;
  filters: KudosFilters;
  t: KudosMessages;
};

// B.3 (highlight, 528 wide, 4px #FFEA9E border, radius 16, 3 lines) and
// C.3 (feed, 680 wide, radius 24, 5 lines + images). Cream #FFF8E1 cards with
// dark text; dividers #FFEA9E.
export function KudoCard({ kudo, variant, viewerId, filters, t }: KudoCardProps) {
  const highlight = variant === "highlight";
  const { shown, more } = truncateHashtags(kudo.hashtags);
  const detail = kudoDetailPath(kudo.id);
  const contentId = `kudo-content-${variant}-${kudo.id}`;

  return (
    <article
      data-testid={highlight ? "highlight-card" : "kudo-card"}
      className={
        highlight
          ? "flex w-[528px] max-w-[calc(100vw-48px)] shrink-0 flex-col gap-4 rounded-2xl border-4 border-saa-accent bg-saa-card px-6 pb-4 pt-6"
          : "flex w-full flex-col gap-4 rounded-3xl bg-saa-card px-6 pb-4 pt-10 lg:px-10"
      }
    >
      <div className="flex items-start justify-between gap-6">
        <KudoPersonInfo person={kudo.sender} heroHover={t.heroHover} anonymousLabel={t.anonymousSender} />
        <span className="flex h-[123px] shrink-0 items-start py-4 text-saa-bg">
          <SendIcon />
        </span>
        <KudoPersonInfo person={kudo.receiver} heroHover={t.heroHover} anonymousLabel={t.anonymousSender} />
      </div>
      <hr className="border-saa-accent" />
      {/* B.4 is a fixed 240px block (content box 120px), so the action row sits
          at the same height on every highlight card. */}
      <div className={`flex flex-col gap-4 ${highlight ? "lg:h-60 lg:justify-center" : ""}`}>
        <p className="text-base font-bold leading-6 tracking-[0.5px] text-saa-muted">{formatKudoTime(kudo.createdAt)}</p>
        {highlight ? (
          <p className="text-center text-base font-bold leading-6 tracking-[0.5px] text-saa-bg">{kudo.title}</p>
        ) : (
          // C.3 "D.4_hashtag" row: centred title + 32px pen icon.
          <div className="flex items-center text-saa-bg">
            <p className="min-w-0 flex-1 text-center text-base font-bold leading-6 tracking-[0.5px]">{kudo.title}</p>
            <span data-testid="kudo-title-pen" className="flex size-8 shrink-0 items-center justify-center">
              <PenIcon className="size-8" />
            </span>
          </div>
        )}
        {/* Click on the message opens the kudos detail (page not built yet). The
            link is a full-size overlay so links / mentions in the rich text are
            not nested inside it. */}
        <div
          className={`relative rounded-xl border border-saa-accent bg-saa-card-content px-6 py-4 text-saa-bg transition-colors hover:bg-saa-accent/60 ${highlight ? "lg:h-[120px] lg:shrink-0 lg:overflow-hidden" : ""}`}
        >
          {/* Named by the message itself, like the whole box was before. */}
          <Link href={detail} aria-labelledby={contentId} className="absolute inset-0 rounded-xl" />
          {/* Rich text ("Viết Kudo") looks bold like the other cards, and the
              sender's bold is heavier (same styling as the editor). */}
          <div
            id={contentId}
            data-testid="kudo-content"
            className={`${highlight ? "line-clamp-3" : "line-clamp-5"} ${kudo.contentDoc ? `kudo-rich ${richTextFont.className}` : "font-bold"} whitespace-pre-line text-justify text-base leading-6 tracking-[0.5px] lg:text-xl lg:leading-8 lg:tracking-normal`}
          >
            {kudo.contentDoc ? <KudoContent doc={kudo.contentDoc} /> : kudo.content}
          </div>
        </div>
        {!highlight && kudo.imageUrls.length > 0 && (
          <div className="flex flex-wrap items-center gap-4">
            {kudo.imageUrls.slice(0, 5).map((src, i) => (
              <a
                key={src + i}
                href={src}
                target="_blank"
                rel="noreferrer"
                className="relative size-[88px] overflow-hidden rounded-[18px] border border-saa-border bg-white"
              >
                {/* Uploads live in Supabase Storage (any host in dev): served as is. */}
                <Image src={src} alt={`${t.attachmentAlt} ${i + 1}`} fill sizes="88px" unoptimized={/^https?:/.test(src)} className="object-cover" />
              </a>
            ))}
          </div>
        )}
        {shown.length > 0 && (
          <p className="truncate text-base font-bold leading-6 tracking-[0.5px] text-saa-badge">
            {shown.map((tag) => (
              <Link key={tag} href={kudosFilterHref({ ...filters, hashtag: tag })} scroll={false} className="mr-2 hover:underline">
                {tag}
              </Link>
            ))}
            {more && <span>…</span>}
          </p>
        )}
      </div>
      <hr className="border-saa-accent" />
      <KudoActions
        kudoId={kudo.id}
        heartCount={kudo.heartCount}
        heartedByMe={kudo.heartedByMe}
        isOwn={kudo.sender.id === viewerId}
        showDetail={highlight}
        t={t}
      />
    </article>
  );
}
