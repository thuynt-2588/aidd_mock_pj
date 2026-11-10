// Shape of every string shown on "Hệ thống giải" (MoMorph zFYDgyj_pD).
import type { AwardSlug } from "./home-messages-types";

/** One prize value: amount (36px) and an optional note below it (14px). */
export type AwardPrize = { amount: string; note?: string };

export type AwardDetail = {
  slug: AwardSlug;
  title: string;
  /** Shorter label for the category menu (C.6 "MVP"); defaults to title. */
  menuTitle?: string;
  /** "\n" starts a new line, as in the Figma text. */
  description: string;
  quantity: string;
  unit: string; // "\n" = line break, as in Figma
  /** Two prizes are joined by the "or" separator (Signature 2025). */
  prizes: AwardPrize[];
};

export interface AwardsMessages {
  caption: string;
  title: string;
  titleAlt: string;
  menuLabel: string;
  quantityLabel: string;
  prizeLabel: string;
  or: string;
  awards: AwardDetail[];
}
