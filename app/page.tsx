import { connection } from "next/server";
import { Suspense } from "react";

import { requireCurrentUser } from "@/lib/auth/get-current-user";
import { getHomeMessages } from "@/lib/i18n/home-messages";
import { getLocale } from "@/lib/i18n/get-locale";
import { setLocaleAction } from "@/lib/i18n/set-locale-action";
import { AwardsSection } from "./_components/home/awards-section";
import { HomeFooter } from "./_components/home/home-footer";
import { HomeHeader } from "./_components/home/home-header";
import { HomeHero, HomeKeyvisualBackground } from "./_components/home/home-hero";
import { KudosSection } from "./_components/home/kudos-section";
import { QuickActionWidget } from "./_components/home/quick-action-widget";
import { RootFurtherSection } from "./_components/home/root-further-section";
import { LanguageSelector } from "./login/_components/language-selector";

// Homepage SAA (MoMorph i87tDx10uM). Session and locale are request-time data,
// so they are read inside <Suspense> (cacheComponents).
async function HomeScreen() {
  // Mark request time first: the Supabase client reads the clock (token
  // expiry) and cacheComponents rejects Date.now() during prerender.
  await connection();
  const [, locale] = await Promise.all([requireCurrentUser(), getLocale()]);
  const t = getHomeMessages(locale);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-clip bg-saa-bg">
      <HomeKeyvisualBackground />
      <HomeHeader t={t} languageSelector={<LanguageSelector current={locale} onSelect={setLocaleAction} />} />
      <main className="relative mx-auto flex w-full max-w-[1512px] flex-col gap-[120px] px-6 pb-[125px] pt-[104px] lg:px-36">
        <HomeHero t={t} />
        <RootFurtherSection t={t} />
        <AwardsSection t={t} />
        <KudosSection t={t} />
      </main>
      <HomeFooter t={t} />
      <QuickActionWidget label={t.widgetLabel} />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomeScreen />
    </Suspense>
  );
}
