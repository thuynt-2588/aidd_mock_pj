// Scroll-spy helpers for the award category menu (C.1–C.6).

export type SectionTop<S extends string> = { slug: S; top: number };

/**
 * The section the reader is on: the last one (in page order) whose top edge
 * has reached `offset` px from the viewport top; the first one before that.
 */
export function findActiveSlug<S extends string>(sections: SectionTop<S>[], offset: number): S | null {
  if (sections.length === 0) return null;
  let active = sections[0].slug;
  for (const { slug, top } of sections) {
    if (top <= offset) active = slug;
  }
  return active;
}

/** "#mvp" → "mvp" when it is one of `slugs`; anything else → null. */
export function slugFromHash<S extends string>(hash: string, slugs: readonly S[]): S | null {
  if (!hash.startsWith("#")) return null;
  let id: string;
  try {
    id = decodeURIComponent(hash.slice(1));
  } catch {
    return null;
  }
  return (slugs as readonly string[]).includes(id) ? (id as S) : null;
}
