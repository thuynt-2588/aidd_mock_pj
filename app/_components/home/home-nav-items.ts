import type { HomeMessages } from "@/lib/i18n/home-messages";

// Destinations of the header/footer links (A1.2–A1.5, 7.2–7.5). Pages other
// than "/" are not built yet; the routes are fixed so they line up later.
export const HOME_PATH = "/";
export const AWARDS_INFO_PATH = "/awards-information";
export const SUN_KUDOS_PATH = "/sun-kudos";
export const STANDARDS_PATH = "/standards";
export const PROFILE_PATH = "/profile";

export type NavItem = { href: string; label: string };

export function getHeaderNavItems(t: HomeMessages): NavItem[] {
  return [
    { href: HOME_PATH, label: t.nav.about },
    { href: AWARDS_INFO_PATH, label: t.nav.awards },
    { href: SUN_KUDOS_PATH, label: t.nav.kudos },
  ];
}

export function getFooterNavItems(t: HomeMessages): NavItem[] {
  return [...getHeaderNavItems(t), { href: STANDARDS_PATH, label: t.nav.standards }];
}

// Shared look of a nav link: normal / hover highlight / selected (yellow,
// underline, Figma text glow 0 4px 4px rgba(0,0,0,.25) + 0 0 6px #FAE287). Figma: Montserrat 700, padding 16, radius 4.
export function navLinkClass(selected: boolean): string {
  const base =
    "rounded p-4 font-bold transition-colors hover:bg-saa-accent-soft focus-visible:outline-2 focus-visible:outline-saa-accent";
  return selected
    ? `${base} rounded-none border-b border-saa-accent text-saa-accent [text-shadow:0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#fae287]`
    : `${base} text-saa-text`;
}
