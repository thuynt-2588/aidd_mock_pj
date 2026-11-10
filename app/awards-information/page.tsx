import Image from "next/image";
import { connection } from "next/server";
import { Suspense } from "react";

import { HomeFooter } from "@/app/_components/home/home-footer";
import { HomeHeader } from "@/app/_components/home/home-header";
import { AWARDS_INFO_PATH } from "@/app/_components/home/home-nav-items";
import { KudosSection } from "@/app/_components/home/kudos-section";
import { LanguageSelector } from "@/app/login/_components/language-selector";
import { requireCurrentUser } from "@/lib/auth/get-current-user";
import { getAwardsMessages } from "@/lib/i18n/awards-messages";
import { getHomeMessages } from "@/lib/i18n/home-messages";
import { getLocale } from "@/lib/i18n/get-locale";
import { setLocaleAction } from "@/lib/i18n/set-locale-action";
import { AwardDetailSection } from "./_components/award-detail-section";
import { AwardsKeyvisual } from "./_components/awards-keyvisual";
import { AwardsMenu } from "./_components/awards-menu";

// "Hệ thống giải" (MoMorph zFYDgyj_pD). Session and locale are request-time
// data, so they are read inside <Suspense> (cacheComponents).
async function AwardsInformationScreen() {
  // The Supabase client reads the clock; mark request time before calling it.
  await connection();
  const [, locale] = await Promise.all([requireCurrentUser(), getLocale()]);
  const t = getHomeMessages(locale);
  const a = getAwardsMessages(locale);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-clip bg-saa-bg">
      <AwardsKeyvisual />
      <HomeHeader
        t={t}
        activePath={AWARDS_INFO_PATH}
        languageSelector={<LanguageSelector current={locale} onSelect={setLocaleAction} />}
      />
      {/* Bìa: padding 96/144, sections 120 apart; content 1152 wide. */}
      <main className="relative mx-auto flex w-full max-w-[1440px] flex-col gap-[120px] px-6 pb-24 pt-[104px] lg:px-36">
        <Image
          src="/login/root-further-title12.png"
          alt={a.titleAlt}
          width={338}
          height={150}
          priority
          className="h-[150px] w-[338px] max-w-full object-contain object-left"
        />
        {/* A: caption · divider · title (32 + 16 + 1 + 16 + 64 = 129px), centred. */}
        <div className="flex flex-col gap-4 text-center">
          <p className="text-2xl font-bold leading-8 text-saa-text">{a.caption}</p>
          <h1 className="border-t border-saa-divider pt-4 text-4xl font-bold leading-[1.1] tracking-[-0.25px] text-saa-accent lg:text-[57px] lg:leading-16">
            {a.title}
          </h1>
        </div>
        {/* B: menu (C, 178 wide, sticky) + award list (D, 853 wide, gap 80). */}
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <AwardsMenu label={a.menuLabel} items={a.awards.map(({ slug, title, menuTitle }) => ({ slug, title: menuTitle ?? title }))} />
          <div className="flex w-full flex-col gap-20 lg:w-[853px] lg:shrink-0">
            {a.awards.map((award, i) => (
              <AwardDetailSection
                key={award.slug}
                award={award}
                labels={a}
                imageRight={i % 2 === 1}
                isLast={i === a.awards.length - 1}
              />
            ))}
          </div>
        </div>
        <KudosSection t={t} widthClass="max-w-[1152px]" />
      </main>
      <HomeFooter t={t} activePath={AWARDS_INFO_PATH} />
    </div>
  );
}

export default function AwardsInformationPage() {
  return (
    <Suspense fallback={null}>
      <AwardsInformationScreen />
    </Suspense>
  );
}
