import Image from "next/image";
import Link from "next/link";

import type { HomeMessages } from "@/lib/i18n/home-messages";
import { ArrowUpRightIcon } from "./arrow-up-right-icon";
import { EventCountdown } from "./event-countdown";
import { AWARDS_INFO_PATH, SUN_KUDOS_PATH } from "./home-nav-items";

type HomeHeroProps = { t: HomeMessages };

const CTA_BASE =
  "flex h-[60px] items-center gap-2 rounded-lg px-6 py-4 text-[22px] font-bold leading-7 transition-all hover:shadow-saa-glow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saa-accent";

const ArrowIcon = ArrowUpRightIcon;

// 3.5 key visual + B1 countdown + B2 event info + B3 CTA (frame y 184–779).
export function HomeHero({ t }: HomeHeroProps) {
  const { event, cta } = t;
  return (
    <section className="relative flex flex-col gap-10">
      <Image
        src="/login/root-further-title12.png"
        alt={t.titleAlt}
        width={451}
        height={200}
        priority
        className="h-[200px] w-[451px] max-w-full object-contain object-left"
      />
      <div className="flex flex-col gap-4">
        <EventCountdown labels={t.countdown} />
        <div className="flex flex-col gap-2 text-saa-text">
          <p className="flex flex-wrap items-baseline gap-x-15 gap-y-2">
            <span className="flex items-baseline gap-2">
              <span className="text-base font-bold leading-6 tracking-[0.15px]">{event.timeLabel}</span>
              <span className="text-2xl font-bold leading-8 text-saa-accent">{event.timeValue}</span>
            </span>
            <span className="flex items-baseline gap-2">
              <span className="text-base font-bold leading-6 tracking-[0.15px]">{event.placeLabel}</span>
              <span className="text-2xl font-bold leading-8 text-saa-accent">{event.placeValue}</span>
            </span>
          </p>
          <p className="text-base font-bold leading-6 tracking-[0.5px]">{event.broadcast}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-10">
        <Link href={AWARDS_INFO_PATH} className={`${CTA_BASE} bg-saa-accent text-saa-bg`}>
          {cta.awards}
          <ArrowIcon />
        </Link>
        <Link
          href={SUN_KUDOS_PATH}
          className={`${CTA_BASE} border border-saa-border bg-saa-accent-soft text-saa-text hover:bg-saa-accent hover:text-saa-bg`}
        >
          {cta.kudos}
          <ArrowIcon />
        </Link>
      </div>
    </section>
  );
}

// Full-width background behind header + hero (Figma: 1512x1392 image, Cover
// gradient 12deg #00101A 23.7% → transparent 48.92%, 1480 tall).
export function HomeKeyvisualBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[1480px] overflow-hidden">
      <Image
        src="/home/keyvisual-bg.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="!h-[1392px] object-cover object-top"
      />
      <div className="absolute inset-0 bg-[linear-gradient(12deg,#00101a_23.7%,rgba(0,18,29,0.46)_38.34%,rgba(0,19,32,0)_48.92%)]" />
    </div>
  );
}
