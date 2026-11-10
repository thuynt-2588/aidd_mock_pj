import Image from "next/image";
import Link from "next/link";

import type { HomeMessages } from "@/lib/i18n/home-messages";
import { HOME_PATH, getFooterNavItems, navLinkClass } from "./home-nav-items";

type HomeFooterProps = { t: HomeMessages; activePath?: string };

// 7: border-top #2E3940, padding 40/90; logo 69x64, links gap 48 (16/24 700),
// copyright Montserrat Alternates 700 16/24.
export function HomeFooter({ t, activePath = HOME_PATH }: HomeFooterProps) {
  return (
    <footer className="w-full border-t border-saa-divider">
      <div className="mx-auto flex max-w-[1512px] flex-wrap items-center justify-between gap-6 px-6 py-10 lg:px-[90px]">
        <div className="flex flex-wrap items-center gap-8 lg:gap-20">
          <Link href={HOME_PATH} aria-label={t.logoAlt}>
            <Image src="/login/logo.png" alt={t.logoAlt} width={69} height={64} className="h-16 w-[69px]" />
          </Link>
          <nav className="flex flex-wrap items-center gap-4 lg:gap-12">
            {getFooterNavItems(t).map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={href === activePath ? "page" : undefined}
                className={`${navLinkClass(href === activePath)} text-base leading-6 tracking-[0.15px]`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="font-alt text-base font-bold leading-6 text-saa-text">{t.copyright}</p>
      </div>
    </footer>
  );
}
