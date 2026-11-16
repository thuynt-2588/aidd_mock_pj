// B.1.1 / B.1.2: the Hashtag and Phòng ban filters live in the URL so a
// filtered view can be shared and both lists (Highlight + All Kudos) read it.

export const SUN_KUDOS_PATH = "/sun-kudos";
const MAX_FILTER_LENGTH = 64;

export type KudosFilters = { hashtag: string | null; department: string | null };

type SearchParams = Record<string, string | string[] | undefined>;

function single(value: string | string[] | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed && trimmed.length <= MAX_FILTER_LENGTH ? trimmed : null;
}

export function parseKudosFilters(params: SearchParams): KudosFilters {
  return { hashtag: single(params.hashtag), department: single(params.department) };
}

export function kudosFilterHref({ hashtag, department }: KudosFilters): string {
  const query = new URLSearchParams();
  if (hashtag) query.set("hashtag", hashtag);
  if (department) query.set("department", department);
  const qs = query.toString();
  return qs ? `${SUN_KUDOS_PATH}?${qs}` : SUN_KUDOS_PATH;
}

/** Kudos detail page (not built yet) — target of "Xem chi tiết" and Copy Link. */
export function kudoDetailPath(id: string): string {
  return `${SUN_KUDOS_PATH}/${id}`;
}

/** Profile page (not built yet) — target of avatar / name clicks. */
export function profilePath(profileId: string): string {
  return `/profile/${profileId}`;
}
