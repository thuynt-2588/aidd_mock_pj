import type { CSSProperties } from "react";

import { KUDOS_ICONS, type KudosIconName } from "@/lib/kudos/kudos-assets";

// Icons for the Sun* Kudos board. The designer's SVG exports (Figma MM_MEDIA_*,
// public/sun_kudos/icon_*.svg) are used as a mask over `currentColor`, so the
// parent picks the colour: white on the dark page, #00101A on the cream cards,
// grey / red for the heart states.

type IconProps = { className?: string };

function MaskIcon({ name, className }: { name: KudosIconName; className: string }) {
  const url = `url(${KUDOS_ICONS[name]})`;
  const style: CSSProperties = {
    maskImage: url,
    WebkitMaskImage: url,
    maskSize: "contain",
    WebkitMaskSize: "contain",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskPosition: "center",
    WebkitMaskPosition: "center",
  };
  return <span aria-hidden data-icon={name} className={`inline-block shrink-0 bg-current ${className}`} style={style} />;
}

/** MM_MEDIA_Pen: 24 (A.1), 32 (kudos title). */
export function PenIcon({ className = "size-6" }: IconProps) {
  return <MaskIcon name="pencil" className={className} />;
}

/** MM_MEDIA_Search: 24 (profile search), 16 (Spotlight). */
export function SearchIcon({ className = "size-6" }: IconProps) {
  return <MaskIcon name="search" className={className} />;
}

/** MM_MEDIA_Down: filter buttons. */
export function ChevronDownIcon({ className = "size-6" }: IconProps) {
  return <MaskIcon name="down" className={className} />;
}

/** MM_MEDIA_Left: 60 (carousel), 28 (pager). */
export function ChevronLeftIcon({ className = "size-7" }: IconProps) {
  return <MaskIcon name="left" className={className} />;
}

/** MM_MEDIA_Right: 60 (carousel), 28 (pager). */
export function ChevronRightIcon({ className = "size-7" }: IconProps) {
  return <MaskIcon name="right" className={className} />;
}

/** MM_MEDIA_Link: Copy Link. */
export function LinkIcon({ className = "size-6" }: IconProps) {
  return <MaskIcon name="link" className={className} />;
}

/** MM_MEDIA_Heart: one shape; the state is the colour (grey / #D4271D). */
export function HeartIcon({ className = "size-8" }: IconProps & { filled?: boolean }) {
  return <MaskIcon name="heart" className={className} />;
}

/** MM_MEDIA_Send (B.3.4 / C.3.2): sender → receiver. */
export function SendIcon({ className = "size-8" }: IconProps) {
  return <MaskIcon name="send" className={className} />;
}

/** MM_MEDIA_Open Gift: "Mở Secret Box". */
export function GiftIcon({ className = "size-6" }: IconProps) {
  return <MaskIcon name="gift" className={className} />;
}

/** B.7.2 Pan/Zoom (30x30). */
export function PanZoomIcon({ className = "size-[30px]" }: IconProps) {
  return <MaskIcon name="zoom" className={className} />;
}

/** "Xem chi tiết" arrow (icon_up.svg). */
export function ArrowUpRightIcon({ className = "size-6" }: IconProps) {
  return <MaskIcon name="up" className={className} />;
}
