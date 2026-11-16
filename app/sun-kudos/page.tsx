import { connection } from "next/server";
import { Suspense } from "react";

import { HomeFooter } from "@/app/_components/home/home-footer";
import { HomeHeader } from "@/app/_components/home/home-header";
import { SUN_KUDOS_PATH } from "@/app/_components/home/home-nav-items";
import { LanguageSelector } from "@/app/login/_components/language-selector";
import { requireCurrentUser } from "@/lib/auth/get-current-user";
import { getHomeMessages } from "@/lib/i18n/home-messages";
import { getKudosMessages } from "@/lib/i18n/kudos-messages";
import { getLocale } from "@/lib/i18n/get-locale";
import { setLocaleAction } from "@/lib/i18n/set-locale-action";
import { kudosFilterHref, parseKudosFilters } from "@/lib/kudos/filters";
import {
  getFilterOptions,
  getHighlightKudos,
  getKudosPage,
  getMyStats,
  getRecentGiftRecipients,
  getSpotlight,
  getSpecialDayToday,
} from "@/lib/kudos/kudos-queries";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { FilterDropdown } from "./_components/filter-dropdown";
import { HighlightCarousel } from "./_components/highlight-carousel";
import { KudosFeed } from "./_components/kudos-feed";
import { KudosHero, KudosKeyvisual } from "./_components/kudos-hero";
import { KudosSectionHeader } from "./_components/kudos-section-header";
import { KudosSidebar } from "./_components/kudos-sidebar";
import { KudoHeartsProvider } from "./_components/kudo-hearts";
import { KudosToastProvider } from "./_components/kudos-toast";
import { SpotlightBoard } from "./_components/spotlight-board";

type SunKudosPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// "Sun* Kudos - Live board" (MoMorph MaZUn5xHXZ, Figma 2940:13431, 1440 wide).
// Session, locale, filters and data are request-time, so they are read inside
// <Suspense> (cacheComponents).
async function SunKudosScreen({ searchParams }: SunKudosPageProps) {
  // The Supabase client reads the clock; mark request time before calling it.
  await connection();
  const [user, locale, params] = await Promise.all([requireCurrentUser(), getLocale(), searchParams]);
  const home = getHomeMessages(locale);
  const t = getKudosMessages(locale);
  const filters = parseKudosFilters(params);
  const filterKey = kudosFilterHref(filters);

  const supabase = await createServerSupabaseClient();
  const [highlight, feed, spotlight, stats, gifts, options, specialDay] = await Promise.all([
    getHighlightKudos(supabase, filters),
    getKudosPage(supabase, filters, 0),
    getSpotlight(supabase),
    getMyStats(supabase),
    getRecentGiftRecipients(supabase),
    getFilterOptions(supabase),
    getSpecialDayToday(supabase),
  ]);

  return (
    <KudosToastProvider>
      <KudoHeartsProvider>
        <div className="relative flex min-h-screen w-full flex-col overflow-x-clip bg-saa-bg">
          <KudosKeyvisual />
          <HomeHeader
            t={home}
            activePath={SUN_KUDOS_PATH}
            languageSelector={<LanguageSelector current={locale} onSelect={setLocaleAction} />}
          />
          {/* Bìa: padding 96 top / 120 bottom, sections 120 apart. */}
          <main className="relative flex w-full flex-col gap-[120px] pb-[120px] pt-24">
            {/* Frame 532: A and B share one column with 64px between them. */}
            <div className="flex flex-col gap-16">
              <KudosHero t={t} hashtags={options.hashtags} viewerId={user.id} />

              {/* B: Highlight Kudos */}
              <section className="flex flex-col gap-10">
                <KudosSectionHeader caption={t.caption} title={t.highlightTitle}>
                  <FilterDropdown label={t.filterHashtag} allLabel={t.filterAll} field="hashtag" options={options.hashtags} filters={filters} />
                  <FilterDropdown label={t.filterDepartment} allLabel={t.filterAll} field="department" options={options.departments} filters={filters} />
                </KudosSectionHeader>
                <HighlightCarousel key={filterKey} kudos={highlight} viewerId={user.id} filters={filters} t={t} />
              </section>
            </div>

            {/* B.6 / B.7: Spotlight Board (1157 wide, centred in the 1440 frame) */}
            <section className="flex flex-col gap-10">
              <KudosSectionHeader caption={t.caption} title={t.spotlightTitle} />
              <div className="px-6 lg:px-0">
                <SpotlightBoard data={spotlight} t={t} />
              </div>
            </section>

            {/* C / D: All Kudos + sidebar. Frame 502: list at x 144, gap 80. 680 + 80 + 422
                is 1182, 30px more than 1152, so in Figma the sidebar runs into the right
                padding: keep 114px on the right. Two columns from xl (1280); below, the sidebar
                goes under the list (422 + 80 leaves too little room for the cards). */}
            <section id="all-kudos" className="flex scroll-mt-24 flex-col gap-10">
              <KudosSectionHeader caption={t.caption} title={t.allTitle} />
              <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-6 lg:px-36 xl:flex-row xl:items-start xl:gap-20 xl:pr-[114px]">
                <div className="w-full min-w-0 xl:max-w-[680px] xl:flex-1">
                  <KudosFeed key={filterKey} initial={feed} viewerId={user.id} filters={filters} t={t} />
                </div>
                <KudosSidebar stats={stats} gifts={gifts} specialDay={specialDay} t={t} />
              </div>
            </section>
          </main>
          <HomeFooter t={home} activePath={SUN_KUDOS_PATH} />
        </div>
      </KudoHeartsProvider>
    </KudosToastProvider>
  );
}

export default function SunKudosPage(props: SunKudosPageProps) {
  return (
    <Suspense fallback={null}>
      <SunKudosScreen {...props} />
    </Suspense>
  );
}
