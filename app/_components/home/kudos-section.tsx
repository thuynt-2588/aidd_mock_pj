import Image from "next/image";
import Link from "next/link";

import type { HomeMessages } from "@/lib/i18n/home-messages";
import { ArrowUpRightIcon } from "./arrow-up-right-icon";
import { SUN_KUDOS_PATH } from "./home-nav-items";

type KudosSectionProps = { t: HomeMessages };

// D1/D2: 1120x500 card, radius 16, #0F0F0F + Figma artwork (background,
// illustration and KUDOS logo exported as one image). Text column 457 wide,
// inset 64px, vertically centred; "Chi tiết" is a 56px yellow button.
export function KudosSection({ t }: KudosSectionProps) {
  const { label, title, highlight, body, detail, imageAlt } = t.kudos;
  return (
    <section className="relative mx-auto min-h-[500px] w-full max-w-[1120px] overflow-hidden rounded-2xl bg-[#0f0f0f]">
      <Image src="/home/sun-kudos.png" alt="" fill sizes="(min-width: 1120px) 1120px, 100vw" className="object-cover" />
      {/* MM_MEDIA_Logo/Kudos: 364x72 at (672, 215) inside the 1120x500 card. */}
      <Image
        src="/home/kudos-logo.png"
        alt={imageAlt}
        width={364}
        height={74}
        className="absolute left-[672px] top-[215px] hidden h-[74px] w-[364px] lg:block"
      />
      <div className="relative flex min-h-[500px] w-full max-w-[521px] flex-col justify-center gap-8 px-6 py-6 lg:pl-16">
        <div className="flex flex-col gap-4">
          <p className="text-2xl font-bold leading-8 text-saa-text">{label}</p>
          <h2 className="text-4xl font-bold leading-[1.1] tracking-[-0.25px] text-saa-accent lg:text-[57px] lg:leading-16">
            {title}
          </h2>
          <div className="text-justify text-base font-bold leading-6 tracking-[0.5px] text-saa-text">
            <p>{highlight}</p>
            <p>{body}</p>
          </div>
        </div>
        <Link
          href={SUN_KUDOS_PATH}
          className="flex h-14 w-fit items-center gap-2 rounded bg-saa-accent p-4 text-base font-bold leading-6 tracking-[0.15px] text-saa-bg transition-shadow hover:shadow-saa-glow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saa-accent"
        >
          {detail}
          <ArrowUpRightIcon />
        </Link>
      </div>
    </section>
  );
}
