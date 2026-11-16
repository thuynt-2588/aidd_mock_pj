// B.7 Spotlight word cloud: receivers' names scattered over the board, bigger
// for more kudos (Figma 6.7px … 11.3px). Positions come from a seeded
// golden-angle spiral so server and client render the same layout.

export type SpotlightPerson = { profileId: string; name: string; kudosCount: number };
export type SpotlightNode = SpotlightPerson & { x: number; y: number; fontSize: number };

const MIN_FONT = 6.7;
const MAX_FONT = 11.3;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/** Small deterministic hash (FNV-1a) → [0, 1). */
function unitHash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) / 0x100000000;
}

export function layoutSpotlight(people: SpotlightPerson[], board: { width: number; height: number }): SpotlightNode[] {
  if (people.length === 0) return [];
  const sorted = [...people].sort((a, b) => b.kudosCount - a.kudosCount || a.profileId.localeCompare(b.profileId));
  const max = sorted[0].kudosCount;
  const min = sorted[sorted.length - 1].kudosCount;
  const margin = 0.08;
  const cx = board.width / 2;
  const cy = board.height / 2;
  const rx = board.width * (0.5 - margin);
  const ry = board.height * (0.5 - margin);

  return sorted.map((person, i) => {
    // Most-thanked people sit near the centre; others spiral outwards.
    const t = Math.sqrt((i + 0.5) / sorted.length);
    const angle = i * GOLDEN_ANGLE + unitHash(person.profileId) * 0.6;
    const ratio = max === min ? 0.5 : (person.kudosCount - min) / (max - min);
    return {
      ...person,
      x: Math.round(cx + Math.cos(angle) * rx * t),
      y: Math.round(cy + Math.sin(angle) * ry * t),
      fontSize: Math.round((MIN_FONT + (MAX_FONT - MIN_FONT) * ratio) * 10) / 10,
    };
  });
}
