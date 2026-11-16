import Image from "next/image";
import Link from "next/link";

import { heroBadge } from "@/lib/kudos/format";
import { profilePath } from "@/lib/kudos/filters";
import type { KudoPerson } from "@/lib/kudos/kudos-types";
import type { KudosMessages } from "@/lib/i18n/kudos-messages";
import { HeroBadgeWithHover } from "./hero-badge";

/** 64px round avatar, 1.87px white border; Gmail picture or initials. */
export function KudoAvatar({ name, url, size = 64 }: { name: string; url: string | null; size?: number }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <span
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border-[1.87px] border-white bg-[#eee] text-lg font-bold text-saa-bg"
      style={{ width: size, height: size }}
    >
      {url ? <Image src={url} alt="" fill sizes={`${size}px`} className="object-cover" /> : initials}
    </span>
  );
}

type KudoPersonProps = { person: KudoPerson; heroHover: KudosMessages["heroHover"] };

// B.3.1/B.3.2 · C.3.1/C.3.3: avatar, name, department · hero badge (no stars:
// not in the Figma frame). Avatar and name open the profile (page not built yet).
export function KudoPersonInfo({ person, heroHover }: KudoPersonProps) {
  const badge = heroBadge(person.distinctSenders);
  const href = profilePath(person.id);
  return (
    <div className="flex w-[235px] min-w-0 flex-col items-center gap-[13px]">
      <Link href={href} aria-label={person.name} className="rounded-full focus-visible:outline-2 focus-visible:outline-saa-accent">
        <KudoAvatar name={person.name} url={person.avatarUrl} />
      </Link>
      <div className="flex w-full flex-col items-center gap-0.5">
        <Link href={href} className="max-w-full truncate text-base font-bold leading-6 tracking-[0.15px] text-saa-bg hover:underline">
          {person.name}
        </Link>
        <div className="flex items-center justify-center gap-2.5">
          {person.department && (
            <span className="text-sm font-bold leading-5 tracking-[0.1px] text-saa-muted">{person.department}</span>
          )}
          {badge && <HeroBadgeWithHover badge={badge} hover={heroHover[badge]} />}
        </div>
      </div>
    </div>
  );
}
