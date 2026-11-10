import type { Locale } from "./locale-config";
import { homeMessagesEn } from "./home-messages-en";
import type { HomeMessages } from "./home-messages-types";
import { homeMessagesVi } from "./home-messages-vi";

export type { AwardCopy, AwardSlug, HomeMessages } from "./home-messages-types";

const homeMessages: Record<Locale, HomeMessages> = { vi: homeMessagesVi, en: homeMessagesEn };

export function getHomeMessages(locale: Locale): HomeMessages {
  return homeMessages[locale];
}
