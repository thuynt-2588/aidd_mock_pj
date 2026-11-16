import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { profilePath } from "@/lib/kudos/filters";
import { fillSpecialDayRange } from "@/lib/kudos/format";
import { KUDOS_CAMPAIGN_ICON } from "@/lib/kudos/kudos-assets";
import type { GiftRecipient, KudosStats } from "@/lib/kudos/kudos-types";
import type { KudosMessages } from "@/lib/i18n/kudos-messages";
import { GiftIcon } from "./kudos-icons";
import { KudoAvatar } from "./kudo-person";

type KudosSidebarProps = {
  stats: KudosStats;
  gifts: GiftRecipient[];
  /** Today (YYYY-MM-DD) when it is a special day, else null. */
  specialDay: string | null;
  t: KudosMessages;
};

const BOX = "flex flex-col rounded-[17px] border border-saa-border bg-saa-container-2";

function StatRow({ label, value, badge }: { label: string; value: number; badge?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      {/* Label, then the campaign icon right after its text; value on the right. */}
      <span className="flex min-w-0 flex-1 items-center gap-1">
        <span className="text-lg font-bold leading-7 text-saa-text lg:text-[22px]">{label}</span>
        {badge}
      </span>
      <span className="text-right text-[32px] font-bold leading-10 text-saa-accent">{value}</span>
    </div>
  );
}

// Flame + white "x2" (black stroke, D.1.4: 17.5px on the 34x40 icon), scaled.
function CampaignIcon({ width, height }: { width: number; height: number }) {
  const k = height / 40;
  return (
    <span className="relative flex shrink-0 items-end justify-center" style={{ width, height }}>
      <Image src={KUDOS_CAMPAIGN_ICON} alt="" width={width} height={height} className="absolute inset-0 size-full object-contain" />
      <span
        data-testid="campaign-x2"
        className="relative font-bold text-white [paint-order:stroke_fill]"
        style={{ fontSize: 17.5 * k, lineHeight: `${23 * k}px`, WebkitTextStroke: `${1.04 * k}px #000` }}
      >
        x2
      </span>
    </span>
  );
}

// D.1.4: campaign icon (flame "x2", 34x40) next to the hearts on a special
// day; hover / focus explains the double hearts for the whole day.
function SpecialDayBadge({ day, t }: { day: string; t: KudosMessages }) {
  const text = fillSpecialDayRange(t.campaignText, day, t.campaignDayWord);
  return (
    <span data-testid="special-day-badge" className="group relative flex shrink-0">
      <span tabIndex={0} aria-label={t.specialDayHearts} className="flex h-10 w-[34px] rounded focus-visible:outline-2 focus-visible:outline-saa-accent">
        <CampaignIcon width={34} height={40} />
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute right-0 top-full z-30 mt-2 hidden w-[320px] items-start gap-3 rounded-xl bg-saa-bg p-4 text-left shadow-[0_8px_24px_rgba(0,0,0,0.4)] group-focus-within:flex group-hover:flex"
      >
        <CampaignIcon width={57} height={67} />
        <span className="flex flex-col">
          <span className="text-base font-bold leading-6 text-white">{t.campaignTitle}</span>
          <span className="text-base font-bold leading-6 text-saa-muted">{text}</span>
        </span>
      </span>
    </span>
  );
}

// D: 422 wide, sticky with its own scroll. D.1 stats + "Mở Secret Box";
// D.3 the 10 latest Sunners who received a gift.
export function KudosSidebar({ stats, gifts, specialDay, t }: KudosSidebarProps) {
  return (
    <aside className="flex w-full flex-col gap-6 xl:sticky xl:top-24 xl:max-h-[calc(100vh-112px)] xl:w-[422px] xl:shrink-0 xl:overflow-y-auto">
      <section className={`${BOX} gap-4 p-6`}>
        <StatRow label={t.stats.received} value={stats.kudosReceived} />
        <StatRow label={t.stats.sent} value={stats.kudosSent} />
        <StatRow
          label={t.stats.hearts}
          value={stats.heartsReceived}
          badge={specialDay ? <SpecialDayBadge day={specialDay} t={t} /> : undefined}
        />
        <hr className="border-saa-divider" />
        <StatRow label={t.stats.boxesOpened} value={stats.boxesOpened} />
        <StatRow label={t.stats.boxesUnopened} value={stats.boxesUnopened} />
        {/* D.1.8: opens the Secret Box dialog (separate screen, not built yet);
            disabled while there is no unopened box. */}
        <button
          type="button"
          disabled={stats.boxesUnopened === 0}
          className="flex h-[60px] items-center justify-center gap-2 rounded-lg bg-saa-accent p-4 text-[22px] font-bold leading-7 text-saa-bg transition-shadow hover:shadow-saa-glow disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
        >
          {t.openGift}
          <GiftIcon />
        </button>
      </section>

      <section className={`${BOX} gap-4 py-6 pl-6 pr-4`}>
        <h3 className="whitespace-pre-line text-center text-[22px] font-bold leading-7 text-saa-accent">{t.giftTitle}</h3>
        {gifts.length === 0 ? (
          <p className="text-center text-base font-bold text-saa-muted">{t.noData}</p>
        ) : (
          // Frame 545: 2px #999 scrollbar with 8px radius.
          <ul className="kudos-scrollbar flex max-h-[384px] flex-col gap-4 overflow-y-auto pr-2">
            {gifts.map((g) => (
              <li key={g.id} data-testid="gift-recipient" className="flex items-center gap-2">
                <Link href={profilePath(g.profileId)} aria-label={g.name} className="rounded-full">
                  <KudoAvatar name={g.name} url={g.avatarUrl} />
                </Link>
                {/* D.3.4 Frame 520: 230 wide; name left, gift text right-aligned. */}
                <div className="flex w-[230px] min-w-0 max-w-full flex-col gap-0.5">
                  <Link href={profilePath(g.profileId)} className="truncate text-[22px] font-bold leading-7 text-saa-accent hover:underline">
                    {g.name}
                  </Link>
                  <span data-testid="gift-text" className="text-right text-base font-bold leading-6 tracking-[0.15px] text-saa-text">
                    {g.gift}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
}
