import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import type { HomeMessages } from "@/lib/i18n/home-messages";
import { AccountMenu } from "./account-menu";
import { HOME_PATH, getHeaderNavItems, navLinkClass } from "./home-nav-items";

type HomeHeaderProps = { t: HomeMessages; languageSelector: ReactNode; activePath?: string };

// A1 header: sticky 80px bar, rgba(16,20,23,.8), padding 12/144.
// Logo 52x48 + nav (gap 64 / 24); right group gap 16: bell, language, account.
export function HomeHeader({ t, languageSelector, activePath = HOME_PATH }: HomeHeaderProps) {
  return (
    <header className="sticky top-0 z-50 h-20 w-full bg-saa-home-header backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-[1512px] items-center justify-between gap-6 px-6 py-3 lg:px-36">
        <div className="flex items-center gap-6 lg:gap-16">
          <Link href={HOME_PATH} aria-label={t.logoAlt} className="shrink-0">
            <Image src="/login/logo.png" alt={t.logoAlt} width={52} height={48} className="h-12 w-[52px]" priority />
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {getHeaderNavItems(t).map(({ href, label }) => {
              const selected = href === activePath;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={selected ? "page" : undefined}
                  className={`${navLinkClass(selected)} text-sm leading-5 tracking-[0.1px]`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {/* A1.6: display only — the notification panel is out of scope. */}
          <button
            type="button"
            aria-label={t.notificationsLabel}
            className="relative flex size-10 items-center justify-center rounded transition-colors hover:bg-saa-accent-soft focus-visible:outline-2 focus-visible:outline-saa-accent"
          >
            {/* Figma MM_MEDIA_Noti: 18x21 bell glyph centred in the 40x40 button. */}
            <Image src="/home/icon-bell.svg" alt="" width={18} height={21} className="h-[21px] w-[18px]" />
          </button>
          {languageSelector}
          <AccountMenu label={t.accountLabel} profileLabel={t.accountMenu.profile} signOutLabel={t.accountMenu.signOut} />
        </div>
      </div>
    </header>
  );
}
