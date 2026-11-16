import type { HeroBadge } from "./format";

// Every image / icon on the Sun* Kudos board (Figma MaZUn5xHXZ "MM_MEDIA_*"
// layers), exported by the designer into public/sun_kudos/. To swap one,
// replace the file (same name) or change the path here.

/** MM_MEDIA_KV Background — 1440x512 artwork behind the header and hero. */
export const KUDOS_KEYVISUAL = "/sun_kudos/keyvisual-bg.png";

/** MM_MEDIA_Kudos logo — "KUDOS" wordmark under the hero title. */
export const KUDOS_LOGO = { src: "/sun_kudos/kudos-logo.png", width: 593, height: 106 };

/** B.7 "Root further mo rong 1" — 1157x548 pre-darkened artwork, bottom layer of the Spotlight board. */
export const SPOTLIGHT_TEXTURE = "/sun_kudos/spotlight-texture.png";

/** B.7 "image 24 / 25" — network lines (30% black + white lines, semi-transparent), drawn on top of the texture. */
export const SPOTLIGHT_NETWORK = "/sun_kudos/spotlight-bg.png";

/** D.1.4 campaign: flame with "x2" (57x67 full-colour SVG, shown as an image). */
export const KUDOS_CAMPAIGN_ICON = "/sun_kudos/icon_campain.svg";

/** MM_MEDIA_* icons (SVG, used as masks so CSS sets the colour). */
export const KUDOS_ICONS = {
  pencil: "/sun_kudos/icon_pencil.svg",
  search: "/sun_kudos/icon_search.svg",
  down: "/sun_kudos/icon_down.svg",
  left: "/sun_kudos/icon_left.svg",
  right: "/sun_kudos/icon_right.svg",
  link: "/sun_kudos/icon_link.svg",
  heart: "/sun_kudos/icon_heart.svg",
  send: "/sun_kudos/icon_send.svg",
  gift: "/sun_kudos/icon_gift.svg",
  zoom: "/sun_kudos/icon_zoom.svg",
  up: "/sun_kudos/icon_up.svg",
} as const;
export type KudosIconName = keyof typeof KUDOS_ICONS;

/**
 * MM_MEDIA_New / Rising / Super / Legend Hero — complete badge artwork (title,
 * colours and border included, 2x files); shown at 109x19 and 218x38 (hover).
 */
export const HERO_BADGE_IMAGES: Record<HeroBadge, string> = {
  "New Hero": "/sun_kudos/badge-new-hero.png",
  "Rising Hero": "/sun_kudos/badge-rising-hero.png",
  "Super Hero": "/sun_kudos/badge-super-hero.png",
  "Legend Hero": "/sun_kudos/badge-legend-hero.png",
};
