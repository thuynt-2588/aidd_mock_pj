import Image from "next/image";
import Link from "next/link";

import type { AwardCopy, HomeMessages } from "@/lib/i18n/home-messages";
import { ArrowUpRightIcon } from "./arrow-up-right-icon";
import { AWARDS_INFO_PATH } from "./home-nav-items";

type AwardsSectionProps = { t: HomeMessages };

// C2.x card: one link (picture, title, description, "Chi tiết") whose
// accessible name is the award title; hover lifts the card and adds the glow.
function AwardCard({ award, detail }: { award: AwardCopy; detail: string }) {
  const titleId = `award-title-${award.slug}`;
  return (
    <Link
      href={`${AWARDS_INFO_PATH}#${award.slug}`}
      aria-labelledby={titleId}
      className="group flex flex-col gap-6 rounded-3xl transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-saa-accent"
    >
      <Image
        src={`/home/award-${award.slug}.png`}
        alt=""
        width={336}
        height={336}
        // The exported artwork already includes the gold border and glow.
        className="aspect-square w-full object-contain"
      />
      <span className="flex flex-col gap-5">
        <span className="flex flex-col gap-1">
          <span id={titleId} className="text-2xl leading-8 text-saa-accent">
            {award.title}
          </span>
          <span className="line-clamp-2 text-base leading-6 tracking-[0.5px] text-saa-text">{award.description}</span>
        </span>
        <span className="flex items-center gap-1 text-base font-medium leading-6 tracking-[0.15px] text-saa-text">
          {detail}
          <ArrowUpRightIcon />
        </span>
      </span>
    </Link>
  );
}

// C1 header + C2 grid (3 columns desktop, 2 below 1024px; gap 108 / 96).
export function AwardsSection({ t }: AwardsSectionProps) {
  const { caption, title, detail, items } = t.awardsSection;
  return (
    <section id="awards" className="flex flex-col gap-20">
      {/* C1: caption · divider · title (32 + 16 + 1 + 16 + 64 = 129px) */}
      <div className="flex flex-col gap-4">
        <p className="text-2xl font-bold leading-8 text-saa-text">{caption}</p>
        <h2 className="border-t border-saa-divider pt-4 text-4xl font-bold leading-[1.1] tracking-[-0.25px] text-saa-accent lg:text-[57px] lg:leading-16">
          {title}
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-16 lg:grid-cols-3 lg:gap-x-[108px] lg:gap-y-24">
        {items.map((award) => (
          <AwardCard key={award.slug} award={award} detail={detail} />
        ))}
      </div>
    </section>
  );
}
