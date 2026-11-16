import Image from "next/image";

import type { KudosMessages } from "@/lib/i18n/kudos-messages";
import { KUDOS_KEYVISUAL, KUDOS_LOGO } from "@/lib/kudos/kudos-assets";
import { SearchIcon } from "./kudos-icons";
import { WriteKudoLauncher } from "./write-kudo/write-kudo-launcher";

const PILL =
  "flex h-[72px] items-center gap-4 rounded-[68px] border border-saa-border bg-saa-accent-soft px-4 py-6 text-base font-bold leading-6 tracking-[0.15px] text-saa-text transition-colors hover:bg-saa-accent-selected focus-visible:outline-2 focus-visible:outline-saa-accent";

// Keyvisual behind header + A (1440x512 artwork, 25deg #00101A gradient).
export function KudosKeyvisual() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[957px] overflow-hidden">
      <Image src={KUDOS_KEYVISUAL} alt="" fill priority sizes="100vw" className="!h-[512px] object-cover object-top" />
      <div className="absolute inset-0 bg-[linear-gradient(25deg,#00101a_14.74%,rgba(0,19,32,0)_47.8%)]" />
      <div className="absolute inset-x-0 top-[412px] h-[100px] bg-linear-to-b from-transparent to-saa-bg" />
    </div>
  );
}

// A: title (36/44 #FFEA9E) + KUDOS logo; A.1 "send kudos" pill (738 wide)
// and the profile search pill (381 wide).
export function KudosHero({ t, hashtags, viewerId }: { t: KudosMessages; hashtags: string[]; viewerId: string }) {
  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-16 px-6 lg:px-36">
      <div className="flex flex-col gap-2.5">
        <h1 className="text-3xl font-bold leading-[44px] text-saa-accent lg:text-4xl">{t.heroTitle}</h1>
        <Image src={KUDOS_LOGO.src} alt={t.kudosLogoAlt} width={KUDOS_LOGO.width} height={KUDOS_LOGO.height} className="h-auto w-[300px] lg:w-[593px]" />
      </div>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* A.1: opens the "Viết Kudo" dialog (MoMorph ihQ26W78P2). */}
        <WriteKudoLauncher t={t} hashtags={hashtags} viewerId={viewerId} className={`${PILL} w-full text-left lg:w-[738px]`} />
        {/* Profile search (separate screen, not built yet). */}
        <button type="button" className={`${PILL} w-full lg:w-[381px]`}>
          <SearchIcon />
          {t.searchProfile}
        </button>
      </div>
    </section>
  );
}
