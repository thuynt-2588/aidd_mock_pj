// Display rules for kudos cards (MoMorph MaZUn5xHXZ). Times are shown in
// Vietnam time whatever the viewer's timezone, so server and client agree.

const TIME_ZONE = "Asia/Ho_Chi_Minh";

function parts(iso: string, options: Intl.DateTimeFormatOptions): Record<string, string> {
  const formatter = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, ...options });
  return Object.fromEntries(formatter.formatToParts(new Date(iso)).map((p) => [p.type, p.value]));
}

/** C.3.4 / B.4.1: "HH:mm - MM/DD/YYYY", e.g. "10:00 - 10/30/2025". */
export function formatKudoTime(iso: string): string {
  const p = parts(iso, { hour: "2-digit", minute: "2-digit", hourCycle: "h23", day: "2-digit", month: "2-digit", year: "numeric" });
  return `${p.hour}:${p.minute} - ${p.month}/${p.day}/${p.year}`;
}

/** Spotlight live feed: "08:30PM". */
export function formatTickerTime(iso: string): string {
  const p = parts(iso, { hour: "2-digit", minute: "2-digit", hour12: true });
  return `${p.hour}:${p.minute}${p.dayPeriod.toUpperCase()}`;
}

export type HeroBadge = "New Hero" | "Rising Hero" | "Super Hero" | "Legend Hero";

/**
 * Hero badge from the number of different Sunners who sent this person kudos
 * (badge hover text): 1–4 New, 5–9 Rising, 10–20 Super, more than 20 Legend.
 */
export function heroBadge(distinctSenders: number): HeroBadge | null {
  if (distinctSenders <= 0) return null;
  if (distinctSenders <= 4) return "New Hero";
  if (distinctSenders <= 9) return "Rising Hero";
  if (distinctSenders <= 20) return "Super Hero";
  return "Legend Hero";
}

/**
 * Campaign hover: a special day lasts the whole Vietnam day. Fills "{from}" /
 * "{to}" with "00:00 <word> DD/MM" / "23:59 <word> DD/MM" (word: "ngày" / "on").
 */
export function fillSpecialDayRange(template: string, day: string, word: string): string {
  const [, month, date] = day.split("-");
  const ddmm = `${date}/${month}`;
  return template.replace("{from}", `00:00 ${word} ${ddmm}`).replace("{to}", `23:59 ${word} ${ddmm}`);
}

/** "1.000" — dot as thousands separator, like Figma. */
export function formatHeartCount(count: number): string {
  return String(count).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export const MAX_HASHTAGS = 5;

/** B.4.3 / C.3.7: at most 5 hashtags, then "…". */
export function truncateHashtags(tags: string[]): { shown: string[]; more: boolean } {
  return { shown: tags.slice(0, MAX_HASHTAGS), more: tags.length > MAX_HASHTAGS };
}
